<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAgencyRequest;
use App\Http\Requests\UpdateAgencyRequest;
use App\Models\Agency;
use Illuminate\Http\JsonResponse;

class AgencyController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $agencies = Agency::orderBy('alias')
            ->get()
            ->map(function ($agency) {
                return [
                    'id' => $agency->id,
                    'apelido' => $agency->alias,
                    'nome' => $agency->name,
                    'description' => $agency->description,
                    'created_at' => $agency->created_at->format('d/m/Y H:i:s'),
                    'updated_at' => $agency->updated_at->format('d/m/Y H:i:s'),
                ];
            });

        return response()->json($agencies);
    }

    public function store(StoreAgencyRequest $request): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $agency = Agency::create($request->validated());

        return response()->json([
            'id' => $agency->id,
            'apelido' => $agency->alias,
            'nome' => $agency->name,
            'description' => $agency->description,
            'created_at' => $agency->created_at->format('d/m/Y H:i:s'),
            'updated_at' => $agency->updated_at->format('d/m/Y H:i:s'),
        ], 201);
    }

    public function show(Agency $agency): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        return response()->json([
            'id' => $agency->id,
            'apelido' => $agency->alias,
            'nome' => $agency->name,
            'description' => $agency->description,
            'created_at' => $agency->created_at->format('d/m/Y H:i:s'),
            'updated_at' => $agency->updated_at->format('d/m/Y H:i:s'),
        ]);
    }

    public function update(UpdateAgencyRequest $request, Agency $agency): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $agency->update($request->validated());

        return response()->json([
            'id' => $agency->id,
            'apelido' => $agency->alias,
            'nome' => $agency->name,
            'description' => $agency->description,
            'created_at' => $agency->created_at->format('d/m/Y H:i:s'),
            'updated_at' => $agency->updated_at->format('d/m/Y H:i:s'),
        ]);
    }

    public function destroy(Agency $agency): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $agency->delete();

        return response()->json(['message' => 'Agência excluída com sucesso.']);
    }

    public function trashed(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $trashedAgencies = Agency::onlyTrashed()
            ->orderBy('deleted_at', 'desc')
            ->get()
            ->map(function ($agency) {
                return [
                    'id' => $agency->id,
                    'apelido' => $agency->alias,
                    'nome' => $agency->name,
                    'description' => $agency->description,
                    'dataExclusao' => $agency->deleted_at->format('d/m/Y H:i:s'),
                ];
            });

        return response()->json($trashedAgencies);
    }

    public function restore($id): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $agency = Agency::onlyTrashed()->findOrFail($id);
        $agency->restore();

        return response()->json(['message' => 'Agência recuperada com sucesso.']);
    }
}
