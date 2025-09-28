<?php

namespace App\Http\Controllers;

use App\Models\AcademicBond;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Buscar vínculo acadêmico ativo do discente
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->with(['advisor:id,name', 'coAdvisor:id,name', 'researchLine:id,name'])
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado'], 404);
        }

        $modalityMap = [
            'graduation' => 'Graduação',
            'master' => 'Mestrado',
            'doctorate' => 'Doutorado',
            'post-doctorate' => 'Pós-Doutorado',
        ];

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'modality' => $modalityMap[$academicBond->level] ?? 'Não definido',
            'advisor' => $academicBond->advisor ? $academicBond->advisor->name : 'Sem orientador',
            'advisor_id' => $academicBond->advisor_id,
            'co_advisor' => $academicBond->coAdvisor ? $academicBond->coAdvisor->name : null,
            'co_advisor_id' => $academicBond->co_advisor_id,
            'research_line' => $academicBond->researchLine ? $academicBond->researchLine->name : 'Sem linha de pesquisa',
            'academic_bond' => [
                'id' => $academicBond->id,
                'level' => $academicBond->level,
                'status' => $academicBond->status,
                'start_date' => $academicBond->start_date?->format('d/m/Y'),
                'end_date' => $academicBond->end_date?->format('d/m/Y'),
                'title' => $academicBond->title,
                'description' => $academicBond->description,
            ],
        ]);
    }
}
