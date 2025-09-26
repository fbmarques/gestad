<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDiscenteRequest;
use App\Http\Requests\UpdateDiscenteRequest;
use App\Models\AcademicBond;
use App\Models\Agency;
use App\Models\ResearchLine;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DiscenteController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $discentes = User::whereHas('roles', function ($query) {
            $query->where('role_id', 3);
        })
            ->with([
                'academicBonds' => function ($query) {
                    $query->orderBy('level')->orderBy('created_at', 'desc');
                },
                'academicBonds.advisor:id,name',
            ])
            ->orderBy('name')
            ->get()
            ->map(function ($discente) {
                $masterBond = $discente->academicBonds->where('level', 'master')->first();
                $doctorateBond = $discente->academicBonds->where('level', 'doctorate')->first();

                // Get co-advisor from bonds (assuming it might be stored as a different field or logic)
                $coAdvisor = null;

                return [
                    'id' => $discente->id,
                    'nome' => $discente->name,
                    'email' => $discente->email,
                    'orientador' => $masterBond?->advisor?->name ?? $doctorateBond?->advisor?->name ?? 'Sem orientador',
                    'orientador_id' => $masterBond?->advisor_id ?? $doctorateBond?->advisor_id,
                    'co_orientador' => $coAdvisor,
                    'co_orientador_id' => null,
                    'nivel_pos_graduacao' => $doctorateBond ? 'doutorado' : ($masterBond ? 'mestrado' : 'indefinido'),
                    'mestrado_status' => $masterBond?->status ?? 'nao-iniciado',
                    'doutorado_status' => $doctorateBond?->status ?? 'nao-iniciado',
                ];
            });

        return response()->json($discentes);
    }

    public function store(StoreDiscenteRequest $request): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        // Create user
        $discente = User::create([
            'name' => $request->nome,
            'email' => $request->email,
            'password' => '12345678', // Default password
        ]);

        // Add discente role
        $discente->roles()->attach(3);

        // Get default agency and research line
        $defaultAgency = Agency::first();
        $defaultResearchLine = ResearchLine::first();

        // Create academic bond
        $level = $request->nivel_pos_graduacao === 'doutorado' ? 'doctorate' : 'master';

        AcademicBond::create([
            'student_id' => $discente->id,
            'advisor_id' => $request->orientador_id,
            'agency_id' => $defaultAgency?->id ?? 1,
            'research_line_id' => $defaultResearchLine?->id ?? 1,
            'level' => $level,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Discente criado com sucesso.',
            'discente' => [
                'id' => $discente->id,
                'nome' => $discente->name,
                'email' => $discente->email,
            ],
        ], 201);
    }

    public function show(User $discente): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        if (! $discente->isDiscente()) {
            return response()->json(['error' => 'Usuário não é um discente.'], 404);
        }

        $discente->load([
            'academicBonds.advisor:id,name',
            'academicBonds' => function ($query) {
                $query->orderBy('level')->orderBy('created_at', 'desc');
            },
        ]);

        $masterBond = $discente->academicBonds->where('level', 'master')->first();
        $doctorateBond = $discente->academicBonds->where('level', 'doctorate')->first();

        return response()->json([
            'id' => $discente->id,
            'nome' => $discente->name,
            'email' => $discente->email,
            'orientador' => $masterBond?->advisor?->name ?? $doctorateBond?->advisor?->name ?? 'Sem orientador',
            'orientador_id' => $masterBond?->advisor_id ?? $doctorateBond?->advisor_id,
            'nivel_pos_graduacao' => $doctorateBond ? 'doutorado' : ($masterBond ? 'mestrado' : 'indefinido'),
            'mestrado_status' => $masterBond?->status ?? 'nao-iniciado',
            'doutorado_status' => $doctorateBond?->status ?? 'nao-iniciado',
        ]);
    }

    public function update(UpdateDiscenteRequest $request, User $discente): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        if (! $discente->isDiscente()) {
            return response()->json(['error' => 'Usuário não é um discente.'], 404);
        }

        // Update basic info
        $discente->update([
            'name' => $request->nome,
            'email' => $request->email,
        ]);

        // Handle academic level transition
        $currentBonds = $discente->academicBonds;
        $masterBond = $currentBonds->where('level', 'master')->first();
        $doctorateBond = $currentBonds->where('level', 'doctorate')->first();

        $requestedLevel = $request->nivel_pos_graduacao;

        // Logic for level transitions
        if ($requestedLevel === 'doutorado') {
            // If requesting doctorate
            if (! $doctorateBond) {
                // Check if master is completed
                if ($masterBond && $masterBond->status === 'completed') {
                    // Create doctorate bond
                    AcademicBond::create([
                        'student_id' => $discente->id,
                        'advisor_id' => $request->orientador_id,
                        'agency_id' => $masterBond->agency_id,
                        'research_line_id' => $masterBond->research_line_id,
                        'level' => 'doctorate',
                        'status' => 'active',
                        'start_date' => now(),
                    ]);
                } else {
                    return response()->json([
                        'error' => 'Não é possível iniciar doutorado sem concluir o mestrado.',
                    ], 422);
                }
            } else {
                // Update existing doctorate bond advisor
                $doctorateBond->update([
                    'advisor_id' => $request->orientador_id,
                ]);
            }
        } else {
            // If requesting master only
            if ($doctorateBond) {
                return response()->json([
                    'error' => 'Não é possível alterar de doutorado para mestrado.',
                ], 422);
            }

            // Update master bond if exists
            if ($masterBond) {
                $masterBond->update([
                    'advisor_id' => $request->orientador_id,
                ]);
            }
        }

        return response()->json([
            'message' => 'Discente atualizado com sucesso.',
        ]);
    }

    public function destroy(User $discente): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        if (! $discente->isDiscente()) {
            return response()->json(['error' => 'Usuário não é um discente.'], 404);
        }

        $discente->delete();

        return response()->json(['message' => 'Discente excluído com sucesso.']);
    }

    public function trashed(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $trashedDiscentes = User::onlyTrashed()
            ->whereHas('roles', function ($query) {
                $query->where('role_id', 3);
            })
            ->with([
                'academicBonds' => function ($query) {
                    $query->orderBy('level')->orderBy('created_at', 'desc');
                },
                'academicBonds.advisor:id,name',
            ])
            ->orderBy('deleted_at', 'desc')
            ->get()
            ->map(function ($discente) {
                $masterBond = $discente->academicBonds->where('level', 'master')->first();
                $doctorateBond = $discente->academicBonds->where('level', 'doctorate')->first();

                return [
                    'id' => $discente->id,
                    'nome' => $discente->name,
                    'email' => $discente->email,
                    'orientador' => $masterBond?->advisor?->name ?? $doctorateBond?->advisor?->name ?? 'Sem orientador',
                    'co_orientador' => '', // To be implemented if needed
                    'status_mestrado' => $this->translateStatus($masterBond?->status ?? 'nao-iniciado'),
                    'status_doutorado' => $this->translateStatus($doctorateBond?->status ?? 'nao-iniciado'),
                    'data_exclusao' => $discente->deleted_at->format('d/m/Y H:i:s'),
                ];
            });

        return response()->json($trashedDiscentes);
    }

    public function restore(int $id): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $discente = User::onlyTrashed()->find($id);

        if (! $discente || ! $discente->isDiscente()) {
            return response()->json(['error' => 'Discente excluído não encontrado.'], 404);
        }

        $discente->restore();

        return response()->json(['message' => 'Discente recuperado com sucesso.']);
    }

    public function docentes(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $docentes = User::whereHas('roles', function ($query) {
            $query->where('role_id', 2);
        })
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($docentes);
    }

    private function translateStatus(string $status): string
    {
        return match ($status) {
            'active' => 'Em curso',
            'completed' => 'Concluído',
            'inactive', 'suspended' => 'Suspenso',
            default => 'Não iniciado'
        };
    }

    public function getAvailableLevels($id)
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $discente = User::where('id', $id)
            ->whereHas('roles', function ($query) {
                $query->where('role_id', 3);
            })
            ->with('academicBonds')
            ->first();

        if (! $discente) {
            return response()->json(['error' => 'Discente não encontrado.'], 404);
        }

        $masterBond = $discente->academicBonds()->where('level', 'master')->first();
        $doctorateBond = $discente->academicBonds()->where('level', 'doctorate')->first();

        $availableLevels = [];

        // Se não tem mestrado, pode criar mestrado
        if (! $masterBond) {
            $availableLevels[] = 'mestrado';
        }

        // Se tem mestrado completed, pode criar doutorado (se não tem)
        if ($masterBond && $masterBond->status === 'completed' && ! $doctorateBond) {
            $availableLevels[] = 'doutorado';
        }

        // Se já tem doutorado, só pode continuar no doutorado
        if ($doctorateBond) {
            $availableLevels = ['doutorado'];
        }

        // Se tem mestrado não completed, só pode continuar no mestrado
        if ($masterBond && $masterBond->status !== 'completed' && ! $doctorateBond) {
            $availableLevels = ['mestrado'];
        }

        return response()->json([
            'available_levels' => $availableLevels,
            'current_bonds' => [
                'master' => $masterBond ? ['status' => $masterBond->status] : null,
                'doctorate' => $doctorateBond ? ['status' => $doctorateBond->status] : null,
            ],
        ]);
    }

    public function resetPassword($id)
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $discente = User::where('id', $id)
            ->whereHas('roles', function ($query) {
                $query->where('role_id', 3);
            })
            ->first();

        if (! $discente) {
            return response()->json(['error' => 'Discente não encontrado.'], 404);
        }

        $discente->update(['password' => '12345678']);

        return response()->json(['message' => 'Senha resetada com sucesso para 12345678.']);
    }
}
