<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicBond;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicBondController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Get academic bonds levels for the authenticated user.
     */
    public function getUserLevels(): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $levels = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->distinct()
            ->pluck('level')
            ->toArray();

        return response()->json(['levels' => $levels]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
