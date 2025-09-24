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

// Catch-all route for React Router (SPA)
// All unmatched GET routes should serve the React app for client-side routing
// Exclude API routes and protected routes to prevent interference
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api|administrativo|docente|discente|login).*');
