<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJournalRequest;
use App\Http\Requests\UpdateJournalRequest;
use App\Models\Journal;
use Illuminate\Http\JsonResponse;

class JournalController extends Controller
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

        $journals = Journal::orderBy('name')
            ->get()
            ->map(function ($journal) {
                return [
                    'id' => $journal->id,
                    'nome' => $journal->name,
                    'instituicao' => $journal->institution,
                    'quali' => $journal->qualis,
                    'issn' => $journal->issn,
                    'tipo' => $journal->type === 'national' ? 'Nacional' : 'Internacional',
                ];
            });

        return response()->json($journals);
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

        $trashedJournals = Journal::onlyTrashed()
            ->orderBy('deleted_at', 'desc')
            ->get()
            ->map(function ($journal) {
                return [
                    'id' => $journal->id,
                    'nome' => $journal->name,
                    'instituicao' => $journal->institution,
                    'quali' => $journal->qualis,
                    'issn' => $journal->issn,
                    'tipo' => $journal->type === 'national' ? 'Nacional' : 'Internacional',
                    'dataExclusao' => $journal->deleted_at->format('d/m/Y H:i:s'),
                ];
            });

        return response()->json($trashedJournals);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreJournalRequest $request): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $validated = $request->validated();
        $validated['type'] = $validated['tipo'] === 'Nacional' ? 'national' : 'international';
        unset($validated['tipo']);

        // Map frontend field names to database field names
        $journalData = [
            'name' => $validated['nome'],
            'institution' => $validated['instituicao'],
            'qualis' => $validated['quali'],
            'issn' => $validated['issn'],
            'type' => $validated['type'],
            'description' => $validated['description'] ?? null,
        ];

        $journal = Journal::create($journalData);

        return response()->json([
            'message' => 'Revista criada com sucesso.',
            'journal' => [
                'id' => $journal->id,
                'nome' => $journal->name,
                'instituicao' => $journal->institution,
                'quali' => $journal->qualis,
                'issn' => $journal->issn,
                'tipo' => $journal->type === 'national' ? 'Nacional' : 'Internacional',
            ],
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $journal = Journal::findOrFail($id);

        return response()->json([
            'id' => $journal->id,
            'nome' => $journal->name,
            'instituicao' => $journal->institution,
            'quali' => $journal->qualis,
            'issn' => $journal->issn,
            'tipo' => $journal->type === 'national' ? 'Nacional' : 'Internacional',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateJournalRequest $request, string $id): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $journal = Journal::findOrFail($id);
        $validated = $request->validated();
        $validated['type'] = $validated['tipo'] === 'Nacional' ? 'national' : 'international';
        unset($validated['tipo']);

        // Map frontend field names to database field names
        $journalData = [
            'name' => $validated['nome'],
            'institution' => $validated['instituicao'],
            'qualis' => $validated['quali'],
            'issn' => $validated['issn'],
            'type' => $validated['type'],
            'description' => $validated['description'] ?? $journal->description,
        ];

        $journal->update($journalData);

        return response()->json([
            'message' => 'Revista atualizada com sucesso.',
            'journal' => [
                'id' => $journal->id,
                'nome' => $journal->name,
                'instituicao' => $journal->institution,
                'quali' => $journal->qualis,
                'issn' => $journal->issn,
                'tipo' => $journal->type === 'national' ? 'Nacional' : 'Internacional',
            ],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $journal = Journal::findOrFail($id);
        $journal->delete();

        return response()->json(['message' => 'Revista excluída com sucesso.']);
    }

    /**
     * Restore the specified resource from trash.
     */
    public function restore(string $id): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $journal = Journal::onlyTrashed()->findOrFail($id);
        $journal->restore();

        return response()->json(['message' => 'Revista recuperada com sucesso.']);
    }
}
