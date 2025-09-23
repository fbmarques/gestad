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

// Catch-all route for React Router (SPA)
// All unmatched GET routes should serve the React app for client-side routing
// Exclude API routes to prevent interference
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*');
