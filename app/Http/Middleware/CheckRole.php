<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $roleId = (int) $role;
        $hasRole = $user->roles()->where('role_id', $roleId)->exists();

        if (! $hasRole) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return $next($request);
    }
}
