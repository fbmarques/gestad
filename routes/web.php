<?php

use Illuminate\Support\Facades\Route;

// SPA Route - Serve React Application
Route::get('/', function () {
    return view('app');
});

// Catch-all route for React Router (SPA)
// All unmatched routes should serve the React app for client-side routing
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
