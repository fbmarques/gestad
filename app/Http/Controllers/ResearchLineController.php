<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreResearchLineRequest;
use App\Http\Requests\UpdateResearchLineRequest;
use App\Models\ResearchLine;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ResearchLineController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $researchLines = ResearchLine::with('coordinator:id,name')
            ->orderBy('name')
            ->get()
            ->map(function ($line) {
                return [
                    'id' => $line->id,
                    'name' => $line->name,
                    'alias' => $line->alias,
                    'description' => $line->description,
                    'coordinator' => $line->coordinator ? $line->coordinator->name : 'Sem coordenador',
                    'coordinator_id' => $line->coordinator_id,
                ];
            });

        return response()->json($researchLines);
    }

    /**
     * Display a listing of the trashed resource.
     */
    public function trashed(): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $trashedLines = ResearchLine::onlyTrashed()
            ->with('coordinator:id,name')
            ->orderBy('deleted_at', 'desc')
            ->get()
            ->map(function ($line) {
                return [
                    'id' => $line->id,
                    'name' => $line->name,
                    'alias' => $line->alias,
                    'description' => $line->description,
                    'coordinator' => $line->coordinator ? $line->coordinator->name : 'Sem coordenador',
                    'coordinator_id' => $line->coordinator_id,
                    'deleted_at' => $line->deleted_at->format('d/m/Y H:i:s'),
                ];
            });

        return response()->json($trashedLines);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreResearchLineRequest $request): JsonResponse
    {
        $researchLine = ResearchLine::create($request->validated());

        $researchLine->load('coordinator:id,name');

        return response()->json([
            'message' => 'Linha de pesquisa criada com sucesso.',
            'data' => [
                'id' => $researchLine->id,
                'name' => $researchLine->name,
                'alias' => $researchLine->alias,
                'description' => $researchLine->description,
                'coordinator' => $researchLine->coordinator ? $researchLine->coordinator->name : 'Sem coordenador',
                'coordinator_id' => $researchLine->coordinator_id,
            ],
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ResearchLine $researchLine): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $researchLine->load('coordinator:id,name');

        return response()->json([
            'id' => $researchLine->id,
            'name' => $researchLine->name,
            'alias' => $researchLine->alias,
            'description' => $researchLine->description,
            'coordinator' => $researchLine->coordinator ? $researchLine->coordinator->name : 'Sem coordenador',
            'coordinator_id' => $researchLine->coordinator_id,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateResearchLineRequest $request, ResearchLine $researchLine): JsonResponse
    {
        $researchLine->update($request->validated());

        $researchLine->load('coordinator:id,name');

        return response()->json([
            'message' => 'Linha de pesquisa atualizada com sucesso.',
            'data' => [
                'id' => $researchLine->id,
                'name' => $researchLine->name,
                'alias' => $researchLine->alias,
                'description' => $researchLine->description,
                'coordinator' => $researchLine->coordinator ? $researchLine->coordinator->name : 'Sem coordenador',
                'coordinator_id' => $researchLine->coordinator_id,
            ],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ResearchLine $researchLine): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $researchLine->delete();

        return response()->json(['message' => 'Linha de pesquisa excluída com sucesso.']);
    }

    /**
     * Restore the specified resource from trash.
     */
    public function restore(int $id): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $researchLine = ResearchLine::onlyTrashed()->findOrFail($id);
        $researchLine->restore();

        return response()->json(['message' => 'Linha de pesquisa recuperada com sucesso.']);
    }

    /**
     * Get list of docentes for coordinator select.
     */
    public function docentes(): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $docentes = User::whereHas('roles', function ($query) {
            $query->where('role_id', 2);
        })
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json($docentes);
    }
}
