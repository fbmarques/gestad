<?php

use App\Http\Controllers\AgencyController;
use App\Http\Controllers\Api\AcademicBondController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DiscenteController;
use App\Http\Controllers\DocenteController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\ResearchLineController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\StudentController;
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
    Route::get('/user/academic-levels', [AcademicBondController::class, 'getUserLevels']);

    // Stats routes (accessible by admin and docente)
    Route::get('/stats/counts', [StatsController::class, 'getCounts']);

    // Dashboard routes (accessible by admin and docente)
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/docente-stats', [DashboardController::class, 'docenteStats']);

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

    // Docentes routes (accessible by admin and docente)
    Route::apiResource('docentes', DocenteController::class);
    Route::get('/docentes-trashed', [DocenteController::class, 'trashed']);
    Route::post('/docentes/{id}/restore', [DocenteController::class, 'restore']);
    Route::post('/docentes/{docente}/reset-password', [DocenteController::class, 'resetPassword']);
    Route::get('/research-lines-dropdown', [DocenteController::class, 'researchLines']);

    // Discentes routes (accessible by admin and docente)
    Route::apiResource('discentes', DiscenteController::class);
    Route::get('/discentes-trashed', [DiscenteController::class, 'trashed']);
    Route::post('/discentes/{id}/restore', [DiscenteController::class, 'restore']);
    Route::get('/discentes/{id}/available-levels', [DiscenteController::class, 'getAvailableLevels']);
    Route::post('/discentes/{id}/reset-password', [DiscenteController::class, 'resetPassword']);
    Route::get('/docentes-dropdown', [DiscenteController::class, 'docentes']);

    // Basic info update for students (accessible by authenticated students)
    Route::patch('/discente/basic-info', [DiscenteController::class, 'updateBasicInfo']);

    // Student routes (accessible by student)
    Route::get('/student/me', [StudentController::class, 'me']);
    Route::get('/student/link-period', [StudentController::class, 'getLinkPeriod']);
    Route::patch('/student/link-period', [StudentController::class, 'updateLinkPeriod']);
    Route::get('/student/agencies', [StudentController::class, 'getAgencies']);
    Route::get('/student/scholarship', [StudentController::class, 'getScholarship']);
    Route::patch('/student/scholarship', [StudentController::class, 'updateScholarship']);
    Route::get('/student/research-definitions', [StudentController::class, 'getResearchDefinitions']);
    Route::patch('/student/research-definitions', [StudentController::class, 'updateResearchDefinitions']);
    Route::get('/student/academic-requirements', [StudentController::class, 'getAcademicRequirements']);
    Route::patch('/student/academic-requirements', [StudentController::class, 'updateAcademicRequirements']);
    Route::get('/student/disciplines', [StudentController::class, 'getDisciplines']);
    Route::post('/student/disciplines', [StudentController::class, 'addDiscipline']);
    Route::delete('/student/disciplines/{studentCourse}', [StudentController::class, 'removeDiscipline']);
    Route::get('/student/available-courses', [StudentController::class, 'getAvailableCourses']);
    Route::get('/student/available-teachers', [StudentController::class, 'getAvailableTeachers']);
    Route::get('/student/publications', [StudentController::class, 'getPublications']);
    Route::post('/student/publications', [StudentController::class, 'addPublication']);
    Route::patch('/student/publications/{publication}', [StudentController::class, 'updatePublication']);
    Route::delete('/student/publications/{publication}', [StudentController::class, 'removePublication']);
    Route::get('/student/available-journals', [StudentController::class, 'getAvailableJournals']);
    Route::get('/student/event-participations', [StudentController::class, 'getEventParticipations']);
    Route::post('/student/event-participations', [StudentController::class, 'addEventParticipation']);
    Route::delete('/student/event-participations/{eventParticipation}', [StudentController::class, 'removeEventParticipation']);
    Route::get('/student/available-events', [StudentController::class, 'getAvailableEvents']);

    // Publications management routes (accessible by admin and docente)
    Route::get('/publications/pending', [PublicationController::class, 'pending']);
    Route::get('/publications/approved', [PublicationController::class, 'approved']);
    Route::get('/publications/rejected', [PublicationController::class, 'rejected']);
    Route::patch('/publications/{publication}/approve', [PublicationController::class, 'approve']);
    Route::patch('/publications/{publication}/reject', [PublicationController::class, 'reject']);
});
