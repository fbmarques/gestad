<?php

namespace App\Http\Controllers;

use App\Models\AcademicBond;
use App\Models\EventParticipation;
use App\Models\Publication;
use App\Models\StudentCourse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ReportController extends Controller
{
    public function docente(Request $request, string $type): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $allowedTypes = ['orientandos', 'producoes', 'prazos', 'definicoes', 'acessos'];
        if (! in_array($type, $allowedTypes, true)) {
            return response()->json(['error' => 'Tipo de relatório inválido.'], 404);
        }

        $activeRole = $request->query('active_role', '');

        $bonds = AcademicBond::query()
            ->where('status', 'active')
            ->with(['student:id,name,email,last_access_at', 'agency:id,name,alias'])
            ->when($activeRole === 'docente' || ($user->isDocente() && ! $user->isAdmin()), function ($query) use ($user) {
                $query->where(function ($bondQuery) use ($user) {
                    $bondQuery->where('advisor_id', $user->id)
                        ->orWhere('co_advisor_id', $user->id);
                });
            })
            ->orderBy('level')
            ->get();

        $payload = match ($type) {
            'orientandos' => $this->buildOrientandosReport($bonds),
            'producoes' => $this->buildProducoesReport($bonds),
            'prazos' => $this->buildPrazosReport($bonds),
            'definicoes' => $this->buildDefinicoesReport($bonds),
            'acessos' => $this->buildAcessosReport($bonds),
        };

        return response()->json([
            'report' => $type,
            'generated_at' => now()->toIso8601String(),
            'title' => $payload['title'],
            'subtitle' => $payload['subtitle'],
            'columns' => $payload['columns'],
            'rows' => $payload['rows'],
        ]);
    }

    private function buildOrientandosReport(Collection $bonds): array
    {
        return [
            'title' => 'Acompanhamento de Orientandos',
            'subtitle' => 'Nome, email, modalidade e período de vínculo dos orientandos ativos.',
            'columns' => ['Orientando', 'Email', 'Modalidade', 'Entrada', 'Saída'],
            'rows' => $bonds->map(function (AcademicBond $bond) {
                return [
                    'student_name' => $bond->student?->name ?? 'Sem nome',
                    'email' => $bond->student?->email ?? '-',
                    'modality' => $this->formatLevel($bond->level),
                    'start_date' => $bond->start_date?->format('d/m/Y') ?? '-',
                    'end_date' => $bond->end_date?->format('d/m/Y') ?? '-',
                ];
            })->values(),
        ];
    }

    private function buildProducoesReport(Collection $bonds): array
    {
        $studentIds = $bonds->pluck('student_id')->filter()->unique()->values();

        $publicationsByStudent = Publication::query()
            ->join('academic_bonds', 'academic_bonds.id', '=', 'publications.academic_bond_id')
            ->whereIn('academic_bonds.student_id', $studentIds)
            ->orderBy('submission_date')
            ->select('publications.*', 'academic_bonds.student_id')
            ->get()
            ->groupBy('student_id');

        return [
            'title' => 'Produção Acadêmica',
            'subtitle' => 'Produções registradas por orientando no sistema.',
            'columns' => ['Orientando', 'Modalidade', 'Submissão', 'Aprovação', 'Publicação'],
            'rows' => $bonds->map(function (AcademicBond $bond) use ($publicationsByStudent) {
                $counts = $this->countPublicationStages(
                    $publicationsByStudent->get($bond->student_id, collect())
                );

                return [
                    'student_name' => $bond->student?->name ?? 'Sem nome',
                    'modality' => $this->formatLevel($bond->level),
                    'submission_count' => $counts['submission'],
                    'approval_count' => $counts['approval'],
                    'publication_count' => $counts['publication'],
                ];
            })->values(),
        ];
    }

    private function countPublicationStages(Collection $publications): array
    {
        $counts = [
            'submission' => 0,
            'approval' => 0,
            'publication' => 0,
        ];

        foreach ($publications as $publication) {
            $counts[$this->resolvePublicationStage($publication)]++;
        }

        return $counts;
    }

    private function resolvePublicationStage(Publication $publication): string
    {
        if ($publication->publication_date || $publication->status === 'P') {
            return 'publication';
        }

        if ($publication->approval_date || $publication->status === 'A') {
            return 'approval';
        }

        return 'submission';
    }
    private function buildPrazosReport(Collection $bonds): array
    {
        $bondIds = $bonds->pluck('id');
        $today = now()->startOfDay();

        $creditsByBond = StudentCourse::query()
            ->join('courses', 'student_courses.course_id', '=', 'courses.id')
            ->whereIn('student_courses.academic_bond_id', $bondIds)
            ->groupBy('student_courses.academic_bond_id')
            ->selectRaw('student_courses.academic_bond_id, COALESCE(SUM(courses.credits), 0) as total_credits')
            ->pluck('total_credits', 'student_courses.academic_bond_id');

        $eventsByBond = EventParticipation::query()
            ->whereIn('academic_bond_id', $bondIds)
            ->groupBy('academic_bond_id')
            ->selectRaw('academic_bond_id, COUNT(*) as total')
            ->pluck('total', 'academic_bond_id');

        $publicationsByBond = Publication::query()
            ->whereIn('academic_bond_id', $bondIds)
            ->groupBy('academic_bond_id')
            ->selectRaw('academic_bond_id, COUNT(*) as total')
            ->pluck('total', 'academic_bond_id');

        return [
            'title' => 'Prazos e Defesas',
            'subtitle' => 'Acompanhamento de saída prevista e cumprimento de requisitos acadêmicos.',
            'columns' => ['Orientando', 'Entrada', 'Saída Prevista', 'Dias', 'Créditos', 'Eventos', 'Artigos'],
            'rows' => $bonds->map(function (AcademicBond $bond) use ($creditsByBond, $eventsByBond, $publicationsByBond, $today) {
                $requiredCredits = $bond->level === 'doctorate' ? 22 : 18;
                $hasEnoughCredits = ((int) ($creditsByBond[$bond->id] ?? 0)) >= $requiredCredits;
                $hasEvents = ((int) ($eventsByBond[$bond->id] ?? 0)) > 0;

                $requiredArticles = 2;
                $hasEnoughArticles = ((int) ($publicationsByBond[$bond->id] ?? 0)) >= $requiredArticles;
                $remainingDays = $bond->end_date
                    ? $today->diffInDays($bond->end_date->copy()->startOfDay(), false)
                    : '-';

                return [
                    'student_name' => $bond->student?->name ?? 'Sem nome',
                    'start_date' => $bond->start_date?->format('d/m/Y') ?? '-',
                    'end_date' => $bond->end_date?->format('d/m/Y') ?? '-',
                    'remaining_days' => $remainingDays,
                    'credits' => $hasEnoughCredits ? 'Ok' : '[-]',
                    'events' => $hasEvents ? 'Ok' : '[-]',
                    'articles' => $hasEnoughArticles ? 'Ok' : '[-]',
                ];
            })->values(),
        ];
    }

    private function buildDefinicoesReport(Collection $bonds): array
    {
        return [
            'title' => 'Definições de Pesquisa',
            'subtitle' => 'Registro das definições essenciais de pesquisa por orientando.',
            'columns' => ['Orientando', 'Problema', 'Questão', 'Objetivos', 'Metodologia'],
            'rows' => $bonds->map(function (AcademicBond $bond) {
                return [
                    'student_name' => $bond->student?->name ?? 'Sem nome',
                    'problem' => $bond->problem_defined ? 'Ok' : '[-]',
                    'question' => $bond->question_defined ? 'Ok' : '[-]',
                    'objectives' => $bond->objectives_defined ? 'Ok' : '[-]',
                    'methodology' => $bond->methodology_defined ? 'Ok' : '[-]',
                ];
            })->values(),
        ];
    }

    private function buildAcessosReport(Collection $bonds): array
    {
        return [
            'title' => 'Último Acesso ao Sistema',
            'subtitle' => 'Consulta do último acesso registrado para cada orientando ativo.',
            'columns' => ['Discente', 'Modalidade', 'Último Acesso'],
            'rows' => $bonds->map(function (AcademicBond $bond) {
                return [
                    'student_name' => $bond->student?->name ?? 'Sem nome',
                    'modality' => $this->formatLevel($bond->level),
                    'last_access_at' => $bond->student?->last_access_at?->format('d/m/Y H:i:s') ?? 'Sem acesso.',
                ];
            })->values(),
        ];
    }

    private function formatLevel(string $level): string
    {
        return match ($level) {
            'master' => 'Mestrado',
            'doctorate' => 'Doutorado',
            'graduation' => 'Graduação',
            'post-doctorate' => 'Pós-Doutorado',
            default => $level,
        };
    }
}
