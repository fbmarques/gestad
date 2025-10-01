<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicBond;
use App\Models\Course;
use App\Models\EventParticipation;
use App\Models\Publication;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        // Discentes Ativos (status=active)
        $activeStudents = AcademicBond::where('status', 'active')->count();

        // Disciplinas Ofertadas (total courses)
        $coursesOffered = Course::whereNull('deleted_at')->count();

        // Defesas Programadas (defense_status=Scheduled)
        $scheduledDefenses = AcademicBond::where('defense_status', 'Scheduled')->count();

        // Defesas Programadas nos próximos 30 dias
        $defensesNext30Days = AcademicBond::where('defense_status', 'Scheduled')
            ->where('defense_date', '>=', now())
            ->where('defense_date', '<=', now()->addDays(30))
            ->count();

        // Publicações (status P, D ou I) - últimos 12 meses
        $publicationsLast12Months = Publication::whereIn('status', ['P', 'D', 'I'])
            ->where('created_at', '>=', now()->subYear())
            ->count();

        // Distribuição Acadêmica por nível (Mestrado/Doutorado)
        $academicDistribution = AcademicBond::where('status', 'active')
            ->select('level', DB::raw('count(*) as value'))
            ->groupBy('level')
            ->get()
            ->map(function ($item) {
                $levelName = match ($item->level) {
                    'master' => 'Mestrado',
                    'doctorate' => 'Doutorado',
                    default => $item->level,
                };

                return [
                    'name' => $levelName,
                    'value' => $item->value,
                ];
            });

        // Publicações por Qualis (join com journals)
        $publicationsByQualis = Publication::whereIn('status', ['P', 'D', 'I'])
            ->join('journals', 'publications.journal_id', '=', 'journals.id')
            ->whereNotNull('journals.qualis')
            ->select('journals.qualis', DB::raw('count(*) as count'))
            ->groupBy('journals.qualis')
            ->orderBy('journals.qualis')
            ->get()
            ->map(function ($item) {
                return [
                    'qualis' => $item->qualis,
                    'count' => $item->count,
                ];
            });

        // Situação de Bolsas (com agência vs sem agência)
        $totalActiveStudents = AcademicBond::where('status', 'active')->count();
        $studentsWithScholarship = AcademicBond::where('status', 'active')
            ->whereNotNull('agency_id')
            ->count();
        $studentsWithoutScholarship = $totalActiveStudents - $studentsWithScholarship;

        $scholarshipPercentage = $totalActiveStudents > 0
            ? round(($studentsWithScholarship / $totalActiveStudents) * 100)
            : 0;

        $scholarshipData = [
            ['name' => 'Com Bolsa', 'value' => $studentsWithScholarship],
            ['name' => 'Sem Bolsa', 'value' => $studentsWithoutScholarship],
        ];

        // Eventos por Mês (últimos 12 meses)
        $eventsMonthly = EventParticipation::select(
            DB::raw('strftime("%Y-%m", created_at) as month'),
            DB::raw('count(*) as events')
        )
            ->where('created_at', '>=', now()->subYear())
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                $monthNumber = (int) substr($item->month, 5, 2);
                $monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

                return [
                    'month' => $monthNames[$monthNumber - 1] ?? $monthNumber,
                    'events' => $item->events,
                ];
            });

        $totalEventsLast12Months = $eventsMonthly->sum('events');

        // Top Docentes (orientadores com mais orientandos ativos)
        $topProfessors = User::select('users.id', 'users.name', DB::raw('count(academic_bonds.id) as students'))
            ->join('academic_bonds', 'users.id', '=', 'academic_bonds.advisor_id')
            ->where('academic_bonds.status', 'active')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('students')
            ->limit(3)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'students' => $item->students,
                ];
            });

        // Top Revistas (journals com mais publicações)
        $topJournals = Publication::whereIn('status', ['P', 'D', 'I'])
            ->join('journals', 'publications.journal_id', '=', 'journals.id')
            ->select('journals.name', DB::raw('count(publications.id) as publications'))
            ->groupBy('journals.id', 'journals.name')
            ->orderByDesc('publications')
            ->limit(3)
            ->get()
            ->map(function ($item) {
                // Criar alias a partir do nome
                $words = explode(' ', $item->name);
                $alias = count($words) > 1
                    ? strtoupper(substr($words[0], 0, 1).substr($words[1] ?? '', 0, 1))
                    : strtoupper(substr($item->name, 0, 4));

                return [
                    'alias' => $alias,
                    'name' => $item->name,
                    'publications' => $item->publications,
                ];
            });

        // Alertas e Pendências
        $alertsData = [];

        // Prazos de Qualificação Vencendo (próximos 30 dias)
        $qualificationsExpiring = AcademicBond::where('qualification_status', 'Scheduled')
            ->where('qualification_date', '>=', now())
            ->where('qualification_date', '<=', now()->addDays(30))
            ->count();

        if ($qualificationsExpiring > 0) {
            $alertsData[] = [
                'type' => 'urgent',
                'title' => 'Prazos de Qualificação Vencendo',
                'description' => "$qualificationsExpiring discentes com prazo em 30 dias",
            ];
        }

        // Produções Pendentes de Aprovação (status = Pending)
        $pendingPublications = Publication::where('status', 'Pending')->count();

        if ($pendingPublications > 0) {
            $alertsData[] = [
                'type' => 'warning',
                'title' => 'Produções Pendentes de Aprovação',
                'description' => "$pendingPublications publicações aguardando análise",
            ];
        }

        // Bolsas a Vencer (próximos 60 dias - usando end_date)
        $scholarshipsExpiring = AcademicBond::where('status', 'active')
            ->whereNotNull('agency_id')
            ->whereNotNull('end_date')
            ->where('end_date', '>=', now())
            ->where('end_date', '<=', now()->addDays(60))
            ->count();

        if ($scholarshipsExpiring > 0) {
            $alertsData[] = [
                'type' => 'info',
                'title' => 'Bolsas a Vencer',
                'description' => "$scholarshipsExpiring bolsas vencem nos próximos 60 dias",
            ];
        }

        // Novas Matrículas (última semana)
        $newEnrollments = AcademicBond::where('created_at', '>=', now()->subWeek())->count();

        if ($newEnrollments > 0) {
            $alertsData[] = [
                'type' => 'success',
                'title' => 'Novas Matrículas',
                'description' => "$newEnrollments novos discentes matriculados esta semana",
            ];
        }

        return response()->json([
            'stats' => [
                'activeStudents' => $activeStudents,
                'coursesOffered' => $coursesOffered,
                'scheduledDefenses' => $scheduledDefenses,
                'defensesNext30Days' => $defensesNext30Days,
                'publicationsLast12Months' => $publicationsLast12Months,
            ],
            'academicDistribution' => $academicDistribution,
            'publicationsByQualis' => $publicationsByQualis,
            'scholarshipData' => $scholarshipData,
            'scholarshipPercentage' => $scholarshipPercentage,
            'eventsMonthly' => $eventsMonthly,
            'totalEventsLast12Months' => $totalEventsLast12Months,
            'topProfessors' => $topProfessors,
            'topJournals' => $topJournals,
            'alertsData' => $alertsData,
        ]);
    }
}
