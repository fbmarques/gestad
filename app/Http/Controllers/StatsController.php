<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Course;
use App\Models\Event;
use App\Models\Journal;
use App\Models\Publication;
use App\Models\ResearchLine;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function getCounts(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        // Get active_role from request parameter (sent from frontend)
        $activeRole = request()->query('active_role', '');

        // Determine if we should filter by advisor based on active role
        $isDocenteRole = $activeRole === 'docente';

        // For discentes count, filter by advisor/co-advisor if active role is docente
        $discentesQuery = User::whereHas('roles', function ($query) {
            $query->where('role_id', 3);
        });

        if ($isDocenteRole) {
            // Filter only students that this docente advises
            $discentesQuery->where(function ($query) use ($user) {
                $query->whereHas('academicBonds', function ($q) use ($user) {
                    $q->where('advisor_id', $user->id)
                        ->orWhere('co_advisor_id', $user->id);
                });
            });
        }

        $counts = [
            'discentes' => $discentesQuery->count(),
            'docentes' => User::whereHas('roles', function ($query) {
                $query->where('role_id', 2);
            })->count(),
            'linhaspesquisa' => ResearchLine::count(),
            'disciplinas' => Course::count(),
            'agencias' => Agency::count(),
            'revistas' => Journal::count(),
            'eventos' => Event::count(),
            'producoes' => Publication::where('status', 'P')->count(), // Contagem de publicações pendentes
        ];

        return response()->json($counts);
    }
}
