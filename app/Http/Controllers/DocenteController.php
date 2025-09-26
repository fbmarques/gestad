<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocenteRequest;
use App\Http\Requests\UpdateDocenteRequest;
use App\Models\ResearchLine;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DocenteController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $docentes = User::whereHas('roles', function ($query) {
            $query->where('role_id', 2);
        })
            ->with(['researchLine:id,name', 'roles'])
            ->orderBy('name')
            ->get()
            ->map(function ($docente) {
                return [
                    'id' => $docente->id,
                    'nome' => $docente->name,
                    'email' => $docente->email,
                    'linhaPesquisa' => $docente->researchLine?->name ?? 'Sem linha de pesquisa',
                    'research_line_id' => $docente->research_line_id,
                    'is_admin' => $docente->isAdmin(),
                ];
            });

        return response()->json($docentes);
    }

    public function store(StoreDocenteRequest $request): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $docente = User::create([
            'name' => $request->nome,
            'email' => $request->email,
            'password' => '123321', // Default password
            'research_line_id' => $request->research_line_id,
        ]);

        // Add docente role
        $docente->roles()->attach(2);

        // Add admin role if requested
        if ($request->is_admin) {
            $docente->roles()->attach(1);
        }

        return response()->json([
            'message' => 'Docente criado com sucesso.',
            'docente' => [
                'id' => $docente->id,
                'nome' => $docente->name,
                'email' => $docente->email,
                'linhaPesquisa' => $docente->researchLine?->name ?? 'Sem linha de pesquisa',
                'research_line_id' => $docente->research_line_id,
                'is_admin' => $docente->isAdmin(),
            ],
        ], 201);
    }

    public function show(User $docente): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        if (! $docente->isDocente()) {
            return response()->json(['error' => 'Usuário não é um docente.'], 404);
        }

        $docente->load(['researchLine:id,name', 'roles']);

        return response()->json([
            'id' => $docente->id,
            'nome' => $docente->name,
            'email' => $docente->email,
            'linhaPesquisa' => $docente->researchLine?->name ?? 'Sem linha de pesquisa',
            'research_line_id' => $docente->research_line_id,
            'is_admin' => $docente->isAdmin(),
        ]);
    }

    public function update(UpdateDocenteRequest $request, User $docente): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        if (! $docente->isDocente()) {
            return response()->json(['error' => 'Usuário não é um docente.'], 404);
        }

        $docente->update([
            'name' => $request->nome,
            'email' => $request->email,
            'research_line_id' => $request->research_line_id,
        ]);

        // Update admin role
        if ($request->is_admin && ! $docente->isAdmin()) {
            $docente->roles()->attach(1);
        } elseif (! $request->is_admin && $docente->isAdmin()) {
            $docente->roles()->detach(1);
        }

        $docente->load(['researchLine:id,name', 'roles']);

        return response()->json([
            'message' => 'Docente atualizado com sucesso.',
            'docente' => [
                'id' => $docente->id,
                'nome' => $docente->name,
                'email' => $docente->email,
                'linhaPesquisa' => $docente->researchLine?->name ?? 'Sem linha de pesquisa',
                'research_line_id' => $docente->research_line_id,
                'is_admin' => $docente->isAdmin(),
            ],
        ]);
    }

    public function destroy(User $docente): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        if (! $docente->isDocente()) {
            return response()->json(['error' => 'Usuário não é um docente.'], 404);
        }

        $docente->delete();

        return response()->json(['message' => 'Docente excluído com sucesso.']);
    }

    public function trashed(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $trashedDocentes = User::onlyTrashed()
            ->whereHas('roles', function ($query) {
                $query->where('role_id', 2);
            })
            ->with(['researchLine:id,name', 'roles'])
            ->orderBy('deleted_at', 'desc')
            ->get()
            ->map(function ($docente) {
                return [
                    'id' => $docente->id,
                    'nome' => $docente->name,
                    'email' => $docente->email,
                    'linhaPesquisa' => $docente->researchLine?->name ?? 'Sem linha de pesquisa',
                    'research_line_id' => $docente->research_line_id,
                    'is_admin' => $docente->isAdmin(),
                    'dataExclusao' => $docente->deleted_at->format('d/m/Y H:i:s'),
                ];
            });

        return response()->json($trashedDocentes);
    }

    public function restore(int $id): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $docente = User::onlyTrashed()->find($id);

        if (! $docente || ! $docente->isDocente()) {
            return response()->json(['error' => 'Docente excluído não encontrado.'], 404);
        }

        $docente->restore();

        return response()->json(['message' => 'Docente recuperado com sucesso.']);
    }

    public function researchLines(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $researchLines = ResearchLine::orderBy('name')
            ->get(['id', 'name']);

        return response()->json($researchLines);
    }

    public function resetPassword(User $docente): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        if (! $docente->isDocente()) {
            return response()->json(['error' => 'Usuário não é um docente.'], 404);
        }

        $docente->update([
            'password' => '123321',
        ]);

        return response()->json(['message' => 'Senha resetada com sucesso.']);
    }
}
