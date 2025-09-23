<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/user', [AuthController::class, 'user']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/roles', [ProfileController::class, 'getUserRoles']);
    Route::get('/user/profile', [ProfileController::class, 'getUserProfile']);
    Route::put('/user/theme', [ProfileController::class, 'updateTheme']);
});