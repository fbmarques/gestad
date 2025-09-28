<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function getUserRoles(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        $roles = $user->roles()->select('slug', 'name')->get();

        return response()->json([
            'success' => true,
            'roles' => $roles,
        ]);
    }

    public function updateTheme(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        $request->validate([
            'theme' => 'required|boolean',
        ]);

        $user->update([
            'theme' => $request->theme,
        ]);

        return response()->json([
            'success' => true,
            'theme' => $user->theme,
            'message' => 'Theme preference updated successfully',
        ]);
    }

    public function getUserProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'theme' => $user->theme,
                'registration' => $user->registration,
                'lattes_url' => $user->lattes_url,
                'orcid' => $user->orcid,
            ],
        ]);
    }
}
