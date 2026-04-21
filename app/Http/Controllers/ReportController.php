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

        $allowedTypes = ['orientandos', 'producoes', 'prazos', 'definicoes'];
        if (! in_array($type, $allowedTypes, true)) {
            return response()->json(['error' => 'Tipo de relatório inválido.'], 404);
        }

        $activeRole = $request->query('active_role', '');

        $bonds = AcademicBond::query()
            ->where('status', 'active')
            ->with(['student:id,name,email', 'agency:id,name,alias'])
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
        $publicationsByBond = Publication::query()
            ->whereIn('academic_bond_id', $bonds->pluck('id'))
            ->orderBy('submission_date')
            ->get()
            ->groupBy('academic_bond_id');

        return [
            'title' => 'Produção Acadêmica',
            'subtitle' => 'Produções registradas por orientando no sistema.',
            'columns' => ['Orientando', 'Modalidade', 'Produções'],
            'rows' => $bonds->map(function (AcademicBond $bond) use ($publicationsByBond) {
                $productions = $publicationsByBond->get($bond->id, collect())
                    ->map(function (Publication $publication) {
                        return [
                            'title' => $publication->title,
                            'status' => $publication->status_display,
                        ];
                    })
                    ->values();

                return [
                    'student_name' => $bond->student?->name ?? 'Sem nome',
                    'modality' => $this->formatLevel($bond->level),
                    'productions' => $productions,
                ];
            })->values(),
        ];
    }

    private function buildPrazosReport(Collection $bonds): array
    {
        $bondIds = $bonds->pluck('id');

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
            'columns' => ['Orientando', 'Entrada', 'Saída Prevista', 'Créditos', 'Eventos', 'Artigos'],
            'rows' => $bonds->map(function (AcademicBond $bond) use ($creditsByBond, $eventsByBond, $publicationsByBond) {
                $requiredCredits = $bond->level === 'doctorate' ? 22 : 18;
                $hasEnoughCredits = ((int) ($creditsByBond[$bond->id] ?? 0)) >= $requiredCredits;
                $hasEvents = ((int) ($eventsByBond[$bond->id] ?? 0)) > 0;

                $requiredArticles = 2;
                $hasEnoughArticles = ((int) ($publicationsByBond[$bond->id] ?? 0)) >= $requiredArticles;

                return [
                    'student_name' => $bond->student?->name ?? 'Sem nome',
                    'start_date' => $bond->start_date?->format('d/m/Y') ?? '-',
                    'end_date' => $bond->end_date?->format('d/m/Y') ?? '-',
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
