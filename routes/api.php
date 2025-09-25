<?php

use App\Http\Controllers\AgencyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResearchLineController;
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

    // Research Lines routes (accessible by admin and docente)
    Route::apiResource('research-lines', ResearchLineController::class);
    Route::get('/research-lines-trashed', [ResearchLineController::class, 'trashed']);
    Route::post('/research-lines/{id}/restore', [ResearchLineController::class, 'restore']);
    Route::get('/docentes', [ResearchLineController::class, 'docentes']);

    // Courses routes (accessible by admin and docente)
    Route::apiResource('courses', CourseController::class);
    Route::get('/courses-trashed', [CourseController::class, 'trashed']);
    Route::post('/courses/{id}/restore', [CourseController::class, 'restore']);

    // Agencies routes (accessible by admin and docente)
    Route::apiResource('agencies', AgencyController::class);
    Route::get('/agencies-trashed', [AgencyController::class, 'trashed']);
    Route::post('/agencies/{id}/restore', [AgencyController::class, 'restore']);

    // Journals routes (accessible by admin and docente)
    Route::apiResource('journals', JournalController::class);
    Route::get('/journals-trashed', [JournalController::class, 'trashed']);
    Route::post('/journals/{id}/restore', [JournalController::class, 'restore']);

    // Events routes (accessible by admin and docente)
    Route::apiResource('events', EventController::class);
    Route::get('/events-trashed', [EventController::class, 'trashed']);
    Route::post('/events/{id}/restore', [EventController::class, 'restore']);
});
