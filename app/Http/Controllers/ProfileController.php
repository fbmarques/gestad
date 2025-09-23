<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function getUserRoles(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        $roles = $user->roles()->select('slug', 'name')->get();

        return response()->json([
            'success' => true,
            'roles' => $roles
        ]);
    }
}
