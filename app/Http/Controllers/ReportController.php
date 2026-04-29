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

        $isDocenteView = $activeRole === 'docente' || ($user->isDocente() && ! $user->isAdmin());
        $isAdminView = ! $isDocenteView && $user->isAdmin();

        $bonds = AcademicBond::query()
            ->where('status', 'active')
            ->with(['student:id,name,email,last_access_at', 'advisor:id,name', 'agency:id,name,alias'])
            ->when($isDocenteView, function ($query) use ($user) {
                $query->where(function ($bondQuery) use ($user) {
                    $bondQuery->where('advisor_id', $user->id)
                        ->orWhere('co_advisor_id', $user->id);
                });
            })
            ->when($isAdminView, function ($query) {
                $query->leftJoin('users as advisors', 'academic_bonds.advisor_id', '=', 'advisors.id')
                    ->leftJoin('users as students', 'academic_bonds.student_id', '=', 'students.id')
                    ->select('academic_bonds.*')
                    ->orderBy('advisors.name')
                    ->orderBy('students.name');
            }, function ($query) {
                $query->orderBy('level');
            })
            ->get();

        $payload = match ($type) {
            'orientandos' => $this->buildOrientandosReport($bonds, $isAdminView),
            'producoes' => $this->buildProducoesReport($bonds, $isAdminView),
            'prazos' => $this->buildPrazosReport($bonds, $isAdminView),
            'definicoes' => $this->buildDefinicoesReport($bonds, $isAdminView),
            'acessos' => $this->buildAcessosReport($bonds, $isAdminView),
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

    private function buildOrientandosReport(Collection $bonds, bool $includeAdvisor): array
    {
        $columns = ['Orientando', 'Email', 'Modalidade', 'Entrada', 'Saída'];
        if ($includeAdvisor) {
            array_unshift($columns, 'Orientador');
        }

        return [
            'title' => 'Acompanhamento de Orientandos',
            'subtitle' => 'Nome, email, modalidade e período de vínculo dos orientandos ativos.',
            'columns' => $columns,
            'rows' => $bonds->map(function (AcademicBond $bond) use ($includeAdvisor) {
                $row = [
                    'student_name' => $bond->student?->name ?? 'Sem nome',
                    'email' => $bond->student?->email ?? '-',
                    'modality' => $this->formatLevel($bond->level),
                    'start_date' => $bond->start_date?->format('d/m/Y') ?? '-',
                    'end_date' => $bond->end_date?->format('d/m/Y') ?? '-',
                ];

                return $this->withAdvisorColumn($row, $bond, $includeAdvisor);
            })->values(),
        ];
    }

    private function buildProducoesReport(Collection $bonds, bool $includeAdvisor): array
    {
        $studentIds = $bonds->pluck('student_id')->filter()->unique()->values();

        $publicationsByStudent = Publication::query()
            ->join('academic_bonds', 'academic_bonds.id', '=', 'publications.academic_bond_id')
            ->whereIn('academic_bonds.student_id', $studentIds)
            ->orderBy('submission_date')
            ->select('publications.*', 'academic_bonds.student_id')
            ->get()
            ->groupBy('student_id');

        $columns = ['Orientando', 'Modalidade', 'Submissão', 'Aprovação', 'Publicação'];
        if ($includeAdvisor) {
            array_unshift($columns, 'Orientador');
        }

        return [
            'title' => 'Produção Acadêmica',
            'subtitle' => 'Produções registradas por orientando no sistema.',
            'columns' => $columns,
            'rows' => $bonds->map(function (AcademicBond $bond) use ($publicationsByStudent, $includeAdvisor) {
                $counts = $this->countPublicationStages(
                    $publicationsByStudent->get($bond->student_id, collect())
                );

                $row = [
                    'student_name' => $bond->student?->name ?? 'Sem nome',
                    'modality' => $this->formatLevel($bond->level),
                    'submission_count' => $counts['submission'],
                    'approval_count' => $counts['approval'],
                    'publication_count' => $counts['publication'],
                ];

                return $this->withAdvisorColumn($row, $bond, $includeAdvisor);
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
    private function buildPrazosReport(Collection $bonds, bool $includeAdvisor): array
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

        $columns = ['Orientando', 'Entrada', 'Saída Prevista', 'Dias', 'Créditos', 'Eventos', 'Artigos'];
        if ($includeAdvisor) {
            array_unshift($columns, 'Orientador');
        }

        return [
            'title' => 'Prazos e Defesas',
            'subtitle' => 'Acompanhamento de saída prevista e cumprimento de requisitos acadêmicos.',
            'columns' => $columns,
            'rows' => $bonds->map(function (AcademicBond $bond) use ($creditsByBond, $eventsByBond, $publicationsByBond, $today, $includeAdvisor) {
                $requiredCredits = $bond->level === 'doctorate' ? 22 : 18;
                $hasEnoughCredits = ((int) ($creditsByBond[$bond->id] ?? 0)) >= $requiredCredits;
                $hasEvents = ((int) ($eventsByBond[$bond->id] ?? 0)) > 0;

                $requiredArticles = 2;
                $hasEnoughArticles = ((int) ($publicationsByBond[$bond->id] ?? 0)) >= $requiredArticles;
                $remainingDays = $bond->end_date
                    ? $today->diffInDays($bond->end_date->copy()->startOfDay(), false)
                    : '-';

                $row = [
                    'student_name' => $bond->student?->name ?? 'Sem nome',
                    'start_date' => $bond->start_date?->format('d/m/Y') ?? '-',
                    'end_date' => $bond->end_date?->format('d/m/Y') ?? '-',
                    'remaining_days' => $remainingDays,
                    'credits' => $hasEnoughCredits ? 'Ok' : '[-]',
                    'events' => $hasEvents ? 'Ok' : '[-]',
                    'articles' => $hasEnoughArticles ? 'Ok' : '[-]',
                ];

                return $this->withAdvisorColumn($row, $bond, $includeAdvisor);
            })->values(),
        ];
    }

    private function buildDefinicoesReport(Collection $bonds, bool $includeAdvisor): array
    {
        $columns = ['Orientando', 'Problema', 'Questão', 'Objetivos', 'Metodologia'];
        if ($includeAdvisor) {
            array_unshift($columns, 'Orientador');
        }

        return [
            'title' => 'Definições de Pesquisa',
            'subtitle' => 'Registro das definições essenciais de pesquisa por orientando.',
            'columns' => $columns,
            'rows' => $bonds->map(function (AcademicBond $bond) use ($includeAdvisor) {
                $row = [
                    'student_name' => $bond->student?->name ?? 'Sem nome',
                    'problem' => $bond->problem_defined ? 'Ok' : '[-]',
                    'question' => $bond->question_defined ? 'Ok' : '[-]',
                    'objectives' => $bond->objectives_defined ? 'Ok' : '[-]',
                    'methodology' => $bond->methodology_defined ? 'Ok' : '[-]',
                ];

                return $this->withAdvisorColumn($row, $bond, $includeAdvisor);
            })->values(),
        ];
    }

    private function buildAcessosReport(Collection $bonds, bool $includeAdvisor): array
    {
        $columns = ['Discente', 'Modalidade', 'Último Acesso'];
        if ($includeAdvisor) {
            array_unshift($columns, 'Orientador');
        }

        return [
            'title' => 'Último Acesso ao Sistema',
            'subtitle' => 'Consulta do último acesso registrado para cada orientando ativo.',
            'columns' => $columns,
            'rows' => $bonds->map(function (AcademicBond $bond) use ($includeAdvisor) {
                $row = [
                    'student_name' => $bond->student?->name ?? 'Sem nome',
                    'modality' => $this->formatLevel($bond->level),
                    'last_access_at' => $bond->student?->last_access_at?->format('d/m/Y H:i:s') ?? 'Sem acesso.',
                ];

                return $this->withAdvisorColumn($row, $bond, $includeAdvisor);
            })->values(),
        ];
    }

    private function withAdvisorColumn(array $row, AcademicBond $bond, bool $includeAdvisor): array
    {
        if (! $includeAdvisor) {
            return $row;
        }

        return ['advisor_name' => $bond->advisor?->name ?? 'Sem orientador'] + $row;
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
