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

        $counts = [
            'discentes' => User::whereHas('roles', function ($query) {
                $query->where('role_id', 3);
            })->count(),
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
