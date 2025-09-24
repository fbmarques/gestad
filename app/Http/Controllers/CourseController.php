<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Models\Course;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $courses = Course::orderBy('code')
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'code' => $course->code,
                    'name' => $course->name,
                    'description' => $course->description,
                    'credits' => $course->credits,
                ];
            });

        return response()->json($courses);
    }

    /**
     * Display a listing of the trashed resource.
     */
    public function trashed(): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $trashedCourses = Course::onlyTrashed()
            ->orderBy('deleted_at', 'desc')
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'code' => $course->code,
                    'name' => $course->name,
                    'description' => $course->description,
                    'credits' => $course->credits,
                    'deleted_at' => $course->deleted_at->format('d/m/Y H:i:s'),
                ];
            });

        return response()->json($trashedCourses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseRequest $request): JsonResponse
    {
        $course = Course::create($request->validated());

        $course = [
            'id' => $course->id,
            'code' => $course->code,
            'name' => $course->name,
            'description' => $course->description,
            'credits' => $course->credits,
        ];

        return response()->json([
            'message' => 'Disciplina criada com sucesso.',
            'data' => $course,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $course = [
            'id' => $course->id,
            'code' => $course->code,
            'name' => $course->name,
            'description' => $course->description,
            'credits' => $course->credits,
        ];

        return response()->json(['data' => $course]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseRequest $request, Course $course): JsonResponse
    {
        $course->update($request->validated());

        $course = [
            'id' => $course->id,
            'code' => $course->code,
            'name' => $course->name,
            'description' => $course->description,
            'credits' => $course->credits,
        ];

        return response()->json([
            'message' => 'Disciplina atualizada com sucesso.',
            'data' => $course,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $course->delete();

        return response()->json(['message' => 'Disciplina excluída com sucesso.']);
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore($id): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $course = Course::onlyTrashed()->findOrFail($id);
        $course->restore();

        return response()->json(['message' => 'Disciplina restaurada com sucesso.']);
    }
}