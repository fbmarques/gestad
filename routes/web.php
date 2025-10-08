<?php

use Illuminate\Support\Facades\Route;

// CSRF cookie route for SPA
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

// SPA Route - Serve React Application
Route::get('/', function () {
    return view('app');
});

// Login route for unauthenticated users
Route::get('/login', function () {
    return view('app');
})->name('login');

// Protected routes with role-based access control
Route::middleware(['auth:sanctum', 'role:1'])->group(function () {
    Route::get('/administrativo', function () {
        return view('app');
    });
});

Route::middleware(['auth:sanctum', 'role:2'])->group(function () {
    Route::get('/docente', function () {
        return view('app');
    });
});

Route::middleware(['auth:sanctum', 'role:3'])->group(function () {
    Route::get('/discente', function () {
        return view('app');
    });
});

// Routes accessible by authenticated users
Route::middleware('auth:sanctum')->group(function () {
    // Profile selection page - accessible by all authenticated users
    Route::get('/selecao', function () {
        return view('app');
    });

    // Routes accessible by admin (role=1) and docente (role=2)
    // Both singular and plural routes for flexibility
    Route::get('/linhaspesquisa', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/linhapesquisa', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/linhaspesquisa-excluidas', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    // Courses routes (accessible by admin and docente)
    Route::get('/disciplinas', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/disciplina', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/disciplinas-excluidas', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    // Agencies routes (accessible by admin and docente)
    Route::get('/agencias', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/agencia', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/agencias-excluidas', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    // Journals routes (accessible by admin and docente)
    Route::get('/revistas', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/revista', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/revistas-excluidas', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    // Events routes (accessible by admin and docente)
    Route::get('/eventos', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/evento', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/eventos-excluidos', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    // Docentes routes (accessible by admin and docente)
    Route::get('/docentes', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/docente', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/docentes-excluidos', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    // Discentes routes (accessible by admin and docente)
    Route::get('/discentes', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/discente', function () {
        // Check if user has role 1, 2, or 3 (admin, docente, or discente can access)
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2, 3])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/discentes-excluidos', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    // Publications routes (accessible by admin and docente)
    Route::get('/producoes', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/producao', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    Route::get('/producoes-status', function () {
        // Check if user has role 1 or 2
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    // Chat route for discente (role 3)
    Route::get('/chat', function () {
        // Check if user has role 3 (discente)
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [3])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });

    // Chat route for docente (role 2)
    Route::get('/chat-docente', function () {
        // Check if user has role 2 (docente)
        $user = auth()->user();
        $hasAccess = $user && $user->roles()->whereIn('role_id', [2])->exists();

        if (! $hasAccess) {
            return response()->json(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.'], 403);
        }

        return view('app');
    });
});

// Catch-all route for React Router (SPA)
// All unmatched GET routes should serve the React app for client-side routing
// Exclude API routes and protected routes to prevent interference
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api|administrativo|docente|discente|login|selecao|linhaspesquisa|linhapesquisa|disciplinas|disciplina|agencias|agencia|revistas|revista|eventos|evento|docentes|discentes|producoes|producao|producoes-status|chat|chat-docente).*');
