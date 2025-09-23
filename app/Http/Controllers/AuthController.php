<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Credenciais inválidas.',
                'errors' => [
                    'email' => ['Email ou senha incorretos.'],
                ],
            ], 422);
        }

        Auth::login($user);
        $request->session()->regenerate();

        $user->load('roles');

        return response()->json([
            'message' => 'Login realizado com sucesso.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('slug')->toArray(),
            ],
            'redirect' => '/selecao',
        ]);
    }

    public function logout(): JsonResponse
    {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout realizado com sucesso.',
        ]);
    }

    public function user(): JsonResponse
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json([
                'message' => 'Usuário não autenticado.',
            ], 401);
        }

        $user->load('roles');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('slug')->toArray(),
            ],
        ]);
    }
}
