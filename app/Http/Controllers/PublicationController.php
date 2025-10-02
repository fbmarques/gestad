<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicationController extends Controller
{
    public function pending(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        // Get active role from request parameter (sent from frontend)
        $activeRole = $request->query('active_role', '');

        $query = Publication::where('status', 'P')
            ->with(['academicBond.student', 'academicBond.advisor', 'journal']);

        // If active role is 'docente', filter only publications from their advisees
        if ($activeRole === 'docente') {
            $query->whereHas('academicBond', function ($q) use ($user) {
                $q->where('advisor_id', $user->id);
            });
        }
        // If active role is 'admin' or empty, show all pending publications (no filter)

        $publications = $query->orderBy('publication_date', 'desc')
            ->get()
            ->map(function ($publication) {
                return [
                    'id' => $publication->id,
                    'titulo' => $publication->title,
                    'discente' => $publication->academicBond->student->name ?? 'N/A',
                    'docente' => $publication->academicBond->advisor->name ?? 'N/A',
                    'periodico' => $publication->journal->name ?? 'N/A',
                    'qualis' => $publication->qualis_rating,
                    'dataPublicacao' => $publication->publication_date ? $publication->publication_date->format('d/m/Y') : 'N/A',
                    'status' => $publication->status,
                ];
            });

        return response()->json($publications);
    }

    public function approved(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $publications = Publication::where('status', 'D')
            ->with(['academicBond.student', 'academicBond.advisor', 'journal'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($publication) {
                return [
                    'id' => $publication->id,
                    'titulo' => $publication->title,
                    'discente' => $publication->academicBond->student->name ?? 'N/A',
                    'docente' => $publication->academicBond->advisor->name ?? 'N/A',
                    'periodico' => $publication->journal->name ?? 'N/A',
                    'qualis' => $publication->qualis_rating,
                    'dataPublicacao' => $publication->publication_date ? $publication->publication_date->format('d/m/Y') : 'N/A',
                    'status' => $publication->status,
                ];
            });

        return response()->json($publications);
    }

    public function rejected(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $publications = Publication::where('status', 'I')
            ->with(['academicBond.student', 'academicBond.advisor', 'journal'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($publication) {
                return [
                    'id' => $publication->id,
                    'titulo' => $publication->title,
                    'discente' => $publication->academicBond->student->name ?? 'N/A',
                    'docente' => $publication->academicBond->advisor->name ?? 'N/A',
                    'periodico' => $publication->journal->name ?? 'N/A',
                    'qualis' => $publication->qualis_rating,
                    'dataPublicacao' => $publication->publication_date ? $publication->publication_date->format('d/m/Y') : 'N/A',
                    'status' => $publication->status,
                ];
            });

        return response()->json($publications);
    }

    public function approve(Request $request, Publication $publication): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        if ($publication->status !== 'P') {
            return response()->json(['error' => 'Esta publicação não está disponível para aprovação.'], 422);
        }

        $publication->update([
            'status' => 'D',
            'evaluated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Publicação deferida com sucesso.',
            'publication' => $publication->fresh()->load(['academicBond.student', 'academicBond.advisor', 'journal']),
        ]);
    }

    public function reject(Request $request, Publication $publication): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        if ($publication->status !== 'P') {
            return response()->json(['error' => 'Esta publicação não está disponível para rejeição.'], 422);
        }

        $publication->update([
            'status' => 'I',
            'evaluated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Publicação indeferida com sucesso.',
            'publication' => $publication->fresh()->load(['academicBond.student', 'academicBond.advisor', 'journal']),
        ]);
    }
}
