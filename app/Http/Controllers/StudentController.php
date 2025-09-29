<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddUserDisciplineRequest;
use App\Http\Requests\AddUserEventParticipationRequest;
use App\Http\Requests\AddUserPublicationRequest;
use App\Http\Requests\UpdateUserAcademicRequirementsRequest;
use App\Http\Requests\UpdateUserLinkPeriodRequest;
use App\Http\Requests\UpdateUserPublicationRequest;
use App\Http\Requests\UpdateUserResearchDefinitionsRequest;
use App\Http\Requests\UpdateUserScholarshipRequest;
use App\Models\AcademicBond;
use App\Models\Agency;
use App\Models\Course;
use App\Models\Event;
use App\Models\EventParticipation;
use App\Models\Journal;
use App\Models\Publication;
use App\Models\StudentCourse;
use App\Models\User;
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

    /**
     * Get the link period (start_date and end_date) for the authenticated user's active academic bond.
     */
    public function getLinkPeriod(): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem acessar o período de vínculo.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        return response()->json([
            'academic_bond' => [
                'start_date' => $academicBond->start_date?->format('Y-m-d'),
                'end_date' => $academicBond->end_date?->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Update the link period (start_date and end_date) for the authenticated user's active academic bond.
     */
    public function updateLinkPeriod(UpdateUserLinkPeriodRequest $request): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem atualizar o período de vínculo.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Update only the fields that were provided
        $fieldsToUpdate = [];

        if ($request->has('start_date')) {
            $fieldsToUpdate['start_date'] = $request->start_date;
        }

        if ($request->has('end_date')) {
            $fieldsToUpdate['end_date'] = $request->end_date;
        }

        if (! empty($fieldsToUpdate)) {
            $academicBond->update($fieldsToUpdate);
        }

        return response()->json([
            'message' => 'Período de vínculo atualizado com sucesso.',
            'academic_bond' => [
                'start_date' => $academicBond->start_date?->format('Y-m-d'),
                'end_date' => $academicBond->end_date?->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Get all available agencies for scholarship selection.
     */
    public function getAgencies(): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem acessar as agências.'], 403);
        }

        $agencies = Agency::whereNull('deleted_at')
            ->orderBy('name')
            ->get(['id', 'name', 'alias'])
            ->map(function ($agency) {
                return [
                    'id' => $agency->id,
                    'name' => $agency->name,
                    'alias' => $agency->alias,
                ];
            });

        return response()->json($agencies);
    }

    /**
     * Get the scholarship information (agency_id) for the authenticated user's active academic bond.
     */
    public function getScholarship(): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem acessar informações de bolsa.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->with('agency:id,name,alias')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        $scholarshipData = [
            'is_scholarship_holder' => $academicBond->agency_id !== null,
            'agency' => null,
        ];

        if ($academicBond->agency_id && $academicBond->agency) {
            $scholarshipData['agency'] = [
                'id' => $academicBond->agency->id,
                'name' => $academicBond->agency->name,
                'alias' => $academicBond->agency->alias,
            ];
        }

        return response()->json($scholarshipData);
    }

    /**
     * Update the scholarship information (agency_id) for the authenticated user's active academic bond.
     */
    public function updateScholarship(UpdateUserScholarshipRequest $request): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem atualizar informações de bolsa.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Update agency_id - can be null (no scholarship) or an agency ID
        $academicBond->update([
            'agency_id' => $request->agency_id,
        ]);

        // Reload the bond with agency relationship for response
        $academicBond->load('agency:id,name,alias');

        $scholarshipData = [
            'is_scholarship_holder' => $academicBond->agency_id !== null,
            'agency' => null,
        ];

        if ($academicBond->agency_id && $academicBond->agency) {
            $scholarshipData['agency'] = [
                'id' => $academicBond->agency->id,
                'name' => $academicBond->agency->name,
                'alias' => $academicBond->agency->alias,
            ];
        }

        $message = $request->agency_id
            ? 'Agência de fomento selecionada com sucesso.'
            : 'Informação de bolsa removida com sucesso.';

        return response()->json([
            'message' => $message,
            'scholarship' => $scholarshipData,
        ]);
    }

    /**
     * Get the research definitions for the authenticated user's active academic bond.
     */
    public function getResearchDefinitions(): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem acessar definições de pesquisa.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        return response()->json([
            'research_definitions' => [
                'problem_defined' => $academicBond->problem_defined,
                'problem_text' => $academicBond->problem_text,
                'question_defined' => $academicBond->question_defined,
                'question_text' => $academicBond->question_text,
                'objectives_defined' => $academicBond->objectives_defined,
                'objectives_text' => $academicBond->objectives_text,
                'methodology_defined' => $academicBond->methodology_defined,
                'methodology_text' => $academicBond->methodology_text,
            ],
        ]);
    }

    /**
     * Update the research definitions for the authenticated user's active academic bond.
     */
    public function updateResearchDefinitions(UpdateUserResearchDefinitionsRequest $request): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem atualizar definições de pesquisa.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Update only the fields that were provided
        $fieldsToUpdate = [];

        if ($request->has('problem_defined')) {
            $fieldsToUpdate['problem_defined'] = $request->problem_defined;
        }

        if ($request->has('problem_text')) {
            $fieldsToUpdate['problem_text'] = $request->problem_text;
        }

        if ($request->has('question_defined')) {
            $fieldsToUpdate['question_defined'] = $request->question_defined;
        }

        if ($request->has('question_text')) {
            $fieldsToUpdate['question_text'] = $request->question_text;
        }

        if ($request->has('objectives_defined')) {
            $fieldsToUpdate['objectives_defined'] = $request->objectives_defined;
        }

        if ($request->has('objectives_text')) {
            $fieldsToUpdate['objectives_text'] = $request->objectives_text;
        }

        if ($request->has('methodology_defined')) {
            $fieldsToUpdate['methodology_defined'] = $request->methodology_defined;
        }

        if ($request->has('methodology_text')) {
            $fieldsToUpdate['methodology_text'] = $request->methodology_text;
        }

        if (! empty($fieldsToUpdate)) {
            $academicBond->update($fieldsToUpdate);
        }

        return response()->json([
            'message' => 'Definições de pesquisa atualizadas com sucesso.',
            'research_definitions' => [
                'problem_defined' => $academicBond->problem_defined,
                'problem_text' => $academicBond->problem_text,
                'question_defined' => $academicBond->question_defined,
                'question_text' => $academicBond->question_text,
                'objectives_defined' => $academicBond->objectives_defined,
                'objectives_text' => $academicBond->objectives_text,
                'methodology_defined' => $academicBond->methodology_defined,
                'methodology_text' => $academicBond->methodology_text,
            ],
        ]);
    }

    /**
     * Get the academic requirements for the authenticated user's active academic bond.
     */
    public function getAcademicRequirements(): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem acessar requisitos acadêmicos.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        return response()->json([
            'academic_requirements' => [
                'qualification_status' => $academicBond->qualification_status,
                'qualification_date' => $academicBond->qualification_date ? $academicBond->qualification_date->format('Y-m-d') : null,
                'qualification_completion_date' => $academicBond->qualification_completion_date ? $academicBond->qualification_completion_date->format('Y-m-d') : null,
                'defense_status' => $academicBond->defense_status,
                'defense_date' => $academicBond->defense_date ? $academicBond->defense_date->format('Y-m-d') : null,
                'defense_completion_date' => $academicBond->defense_completion_date ? $academicBond->defense_completion_date->format('Y-m-d') : null,
                'work_completed' => $academicBond->work_completed,
            ],
        ]);
    }

    /**
     * Update the academic requirements for the authenticated user's active academic bond.
     */
    public function updateAcademicRequirements(UpdateUserAcademicRequirementsRequest $request): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem atualizar requisitos acadêmicos.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Update only the fields that were provided
        $fieldsToUpdate = [];

        if ($request->has('qualification_status')) {
            $fieldsToUpdate['qualification_status'] = $request->qualification_status;

            // If setting to "Not Scheduled", clear related dates
            if ($request->qualification_status === 'Not Scheduled') {
                $fieldsToUpdate['qualification_date'] = null;
                $fieldsToUpdate['qualification_completion_date'] = null;
            }
        }

        if ($request->has('qualification_date')) {
            $fieldsToUpdate['qualification_date'] = $request->qualification_date;
        }

        if ($request->has('qualification_completion_date')) {
            $fieldsToUpdate['qualification_completion_date'] = $request->qualification_completion_date;
        }

        if ($request->has('defense_status')) {
            $fieldsToUpdate['defense_status'] = $request->defense_status;

            // If setting to "Not Scheduled", clear related dates
            if ($request->defense_status === 'Not Scheduled') {
                $fieldsToUpdate['defense_date'] = null;
                $fieldsToUpdate['defense_completion_date'] = null;
            }
        }

        if ($request->has('defense_date')) {
            $fieldsToUpdate['defense_date'] = $request->defense_date;
        }

        if ($request->has('defense_completion_date')) {
            $fieldsToUpdate['defense_completion_date'] = $request->defense_completion_date;
        }

        if ($request->has('work_completed')) {
            $fieldsToUpdate['work_completed'] = $request->work_completed;
        }

        if (! empty($fieldsToUpdate)) {
            $academicBond->update($fieldsToUpdate);
            // Reload the model to get properly cast dates
            $academicBond->refresh();
        }

        return response()->json([
            'message' => 'Requisitos acadêmicos atualizados com sucesso.',
            'academic_requirements' => [
                'qualification_status' => $academicBond->qualification_status,
                'qualification_date' => $academicBond->qualification_date ? $academicBond->qualification_date->format('Y-m-d') : null,
                'qualification_completion_date' => $academicBond->qualification_completion_date ? $academicBond->qualification_completion_date->format('Y-m-d') : null,
                'defense_status' => $academicBond->defense_status,
                'defense_date' => $academicBond->defense_date ? $academicBond->defense_date->format('Y-m-d') : null,
                'defense_completion_date' => $academicBond->defense_completion_date ? $academicBond->defense_completion_date->format('Y-m-d') : null,
                'work_completed' => $academicBond->work_completed,
            ],
        ]);
    }

    /**
     * Get the disciplines (courses) for the authenticated user's active academic bond.
     */
    public function getDisciplines(): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem acessar as disciplinas.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Get student courses with course and docente details
        $studentCourses = StudentCourse::where('academic_bond_id', $academicBond->id)
            ->with(['course', 'docente'])
            ->get()
            ->map(function ($studentCourse) {
                return [
                    'id' => $studentCourse->id,
                    'course_id' => $studentCourse->course->id,
                    'code' => $studentCourse->course->code,
                    'name' => $studentCourse->course->name,
                    'credits' => $studentCourse->course->credits,
                    'docente' => $studentCourse->docente ? $studentCourse->docente->name : 'Sem docente',
                    'docente_id' => $studentCourse->docente_id,
                ];
            });

        // Calculate credits info based on academic level
        $totalCredits = $studentCourses->sum('credits');
        $requiredCredits = $academicBond->level === 'master' ? 18 : 22; // 18 for master, 22 for doctorate
        $progressPercentage = min(($totalCredits / $requiredCredits) * 100, 100);

        return response()->json([
            'disciplines' => $studentCourses,
            'credits_info' => [
                'total_credits' => $totalCredits,
                'required_credits' => $requiredCredits,
                'progress_percentage' => round($progressPercentage, 1),
            ],
        ]);
    }

    /**
     * Add a discipline (course) to the authenticated user's active academic bond.
     */
    public function addDiscipline(AddUserDisciplineRequest $request): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem adicionar disciplinas.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Check if student already has this course
        $existingStudentCourse = StudentCourse::where('academic_bond_id', $academicBond->id)
            ->where('course_id', $request->course_id)
            ->first();

        if ($existingStudentCourse) {
            return response()->json(['error' => 'Esta disciplina já foi adicionada.'], 422);
        }

        // Create the student course
        $studentCourse = StudentCourse::create([
            'academic_bond_id' => $academicBond->id,
            'course_id' => $request->course_id,
            'docente_id' => $request->docente_id,
        ]);

        // Load the course and docente relationships
        $studentCourse->load(['course', 'docente']);

        return response()->json([
            'message' => 'Disciplina adicionada com sucesso.',
            'discipline' => [
                'id' => $studentCourse->id,
                'course_id' => $studentCourse->course->id,
                'code' => $studentCourse->course->code,
                'name' => $studentCourse->course->name,
                'credits' => $studentCourse->course->credits,
                'docente' => $studentCourse->docente ? $studentCourse->docente->name : 'Sem docente',
                'docente_id' => $studentCourse->docente_id,
            ],
        ]);
    }

    /**
     * Remove a discipline (course) from the authenticated user's active academic bond.
     */
    public function removeDiscipline(StudentCourse $studentCourse): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem remover disciplinas.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Check if the student course belongs to this student's academic bond
        if ($studentCourse->academic_bond_id !== $academicBond->id) {
            return response()->json(['error' => 'Disciplina não encontrada ou não pertence a este discente.'], 404);
        }

        $studentCourse->delete();

        return response()->json([
            'message' => 'Disciplina removida com sucesso.',
        ]);
    }

    /**
     * Get available courses for selection.
     */
    public function getAvailableCourses(): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem acessar as disciplinas disponíveis.'], 403);
        }

        $courses = Course::whereNull('deleted_at')
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'credits'])
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'code' => $course->code,
                    'name' => $course->name,
                    'credits' => $course->credits,
                ];
            });

        return response()->json($courses);
    }

    /**
     * Get available teachers (docentes) for selection.
     */
    public function getAvailableTeachers(): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem acessar os docentes disponíveis.'], 403);
        }

        $teachers = User::whereHas('roles', function ($query) {
            $query->where('role_id', 2); // role_id 2 = docente
        })
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                ];
            });

        return response()->json($teachers);
    }

    /**
     * Get the publications for the authenticated user's active academic bond.
     */
    public function getPublications(): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem acessar as publicações.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Get publications with journal details
        $publications = Publication::where('academic_bond_id', $academicBond->id)
            ->with('journal:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($publication) {
                return [
                    'id' => $publication->id,
                    'title' => $publication->title,
                    'journal' => $publication->journal ? $publication->journal->name : 'Sem periódico',
                    'journal_id' => $publication->journal_id,
                    'submission_date' => $publication->submission_date?->format('Y-m-d'),
                    'approval_date' => $publication->approval_date?->format('Y-m-d'),
                    'publication_date' => $publication->publication_date?->format('Y-m-d'),
                    'status' => $publication->status,
                    'status_display' => $publication->status_display,
                    'can_select_for_pdf' => $publication->canBeSelectedForPdf(),
                ];
            });

        return response()->json($publications);
    }

    /**
     * Add a publication to the authenticated user's active academic bond.
     */
    public function addPublication(AddUserPublicationRequest $request): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem adicionar publicações.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Create the publication
        $publication = Publication::create([
            'academic_bond_id' => $academicBond->id,
            'journal_id' => $request->journal_id,
            'title' => $request->title,
            'authors' => [$user->name], // Student is the primary author
            'submission_date' => $request->submission_date,
            'status' => 'S', // Always starts as submitted
            'qualis_rating' => 'B4', // Default qualis rating for new submissions
            'program_evaluation' => 'pending', // Default evaluation status
        ]);

        // Load the journal relationship
        $publication->load('journal:id,name');

        return response()->json([
            'message' => 'Publicação adicionada com sucesso.',
            'publication' => [
                'id' => $publication->id,
                'title' => $publication->title,
                'journal' => $publication->journal ? $publication->journal->name : 'Sem periódico',
                'journal_id' => $publication->journal_id,
                'submission_date' => $publication->submission_date?->format('Y-m-d'),
                'approval_date' => $publication->approval_date?->format('Y-m-d'),
                'publication_date' => $publication->publication_date?->format('Y-m-d'),
                'status' => $publication->status,
                'status_display' => $publication->status_display,
                'can_select_for_pdf' => $publication->canBeSelectedForPdf(),
            ],
        ]);
    }

    /**
     * Update a publication from the authenticated user's active academic bond.
     */
    public function updatePublication(Publication $publication, UpdateUserPublicationRequest $request): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem atualizar publicações.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Check if the publication belongs to this student's academic bond
        if ($publication->academic_bond_id !== $academicBond->id) {
            return response()->json(['error' => 'Publicação não encontrada ou não pertence a este discente.'], 404);
        }

        // Update only the fields that were provided
        $fieldsToUpdate = [];

        if ($request->has('approval_date')) {
            $fieldsToUpdate['approval_date'] = $request->approval_date;
            // When approval date is set, update status to approved
            if ($request->approval_date) {
                $fieldsToUpdate['status'] = 'A';
            }
        }

        if ($request->has('publication_date')) {
            $fieldsToUpdate['publication_date'] = $request->publication_date;
            // When publication date is set, update status to published
            if ($request->publication_date) {
                $fieldsToUpdate['status'] = 'P';
            }
        }

        if (! empty($fieldsToUpdate)) {
            $publication->update($fieldsToUpdate);
            $publication->refresh();
        }

        // Load the journal relationship
        $publication->load('journal:id,name');

        return response()->json([
            'message' => 'Publicação atualizada com sucesso.',
            'publication' => [
                'id' => $publication->id,
                'title' => $publication->title,
                'journal' => $publication->journal ? $publication->journal->name : 'Sem periódico',
                'journal_id' => $publication->journal_id,
                'submission_date' => $publication->submission_date?->format('Y-m-d'),
                'approval_date' => $publication->approval_date?->format('Y-m-d'),
                'publication_date' => $publication->publication_date?->format('Y-m-d'),
                'status' => $publication->status,
                'status_display' => $publication->status_display,
                'can_select_for_pdf' => $publication->canBeSelectedForPdf(),
            ],
        ]);
    }

    /**
     * Remove a publication from the authenticated user's active academic bond.
     */
    public function removePublication(Publication $publication): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem remover publicações.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Check if the publication belongs to this student's academic bond
        if ($publication->academic_bond_id !== $academicBond->id) {
            return response()->json(['error' => 'Publicação não encontrada ou não pertence a este discente.'], 404);
        }

        $publication->delete();

        return response()->json([
            'message' => 'Publicação removida com sucesso.',
        ]);
    }

    /**
     * Get available journals for selection.
     */
    public function getAvailableJournals(): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem acessar os periódicos disponíveis.'], 403);
        }

        $journals = Journal::whereNull('deleted_at')
            ->orderBy('name')
            ->get(['id', 'name', 'qualis'])
            ->map(function ($journal) {
                return [
                    'id' => $journal->id,
                    'name' => $journal->name,
                    'qualis' => $journal->qualis,
                ];
            });

        return response()->json($journals);
    }

    /**
     * Get the event participations for the authenticated user's active academic bond.
     */
    public function getEventParticipations(): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem acessar as participações em eventos.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Get event participations with event details
        $participations = EventParticipation::where('academic_bond_id', $academicBond->id)
            ->with('event:id,nome,alias')
            ->orderBy('year', 'desc')
            ->get()
            ->map(function ($participation) {
                return [
                    'id' => $participation->id,
                    'event_id' => $participation->event_id,
                    'event_name' => $participation->event ? $participation->event->nome : 'Evento não encontrado',
                    'event_alias' => $participation->event ? $participation->event->alias : '',
                    'title' => $participation->title,
                    'name' => $participation->name,
                    'location' => $participation->location,
                    'year' => $participation->year,
                    'type' => $participation->type,
                ];
            });

        return response()->json($participations);
    }

    /**
     * Add an event participation to the authenticated user's active academic bond.
     */
    public function addEventParticipation(AddUserEventParticipationRequest $request): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem adicionar participações em eventos.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Create the event participation
        $participation = EventParticipation::create([
            'academic_bond_id' => $academicBond->id,
            'event_id' => $request->event_id,
            'title' => $request->title,
            'name' => $request->name,
            'location' => $request->location,
            'year' => $request->year,
            'type' => $request->type,
        ]);

        // Load the event relationship
        $participation->load('event:id,nome,alias');

        return response()->json([
            'message' => 'Participação em evento adicionada com sucesso.',
            'participation' => [
                'id' => $participation->id,
                'event_id' => $participation->event_id,
                'event_name' => $participation->event ? $participation->event->nome : 'Evento não encontrado',
                'event_alias' => $participation->event ? $participation->event->alias : '',
                'title' => $participation->title,
                'name' => $participation->name,
                'location' => $participation->location,
                'year' => $participation->year,
                'type' => $participation->type,
            ],
        ]);
    }

    /**
     * Remove an event participation from the authenticated user's active academic bond.
     */
    public function removeEventParticipation(EventParticipation $eventParticipation): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem remover participações em eventos.'], 403);
        }

        // Find the active academic bond for this student
        $academicBond = AcademicBond::where('student_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $academicBond) {
            return response()->json(['error' => 'Nenhum vínculo acadêmico ativo encontrado.'], 404);
        }

        // Check if the event participation belongs to this student's academic bond
        if ($eventParticipation->academic_bond_id !== $academicBond->id) {
            return response()->json(['error' => 'Participação em evento não encontrada ou não pertence a este discente.'], 404);
        }

        $eventParticipation->delete();

        return response()->json([
            'message' => 'Participação em evento removida com sucesso.',
        ]);
    }

    /**
     * Get available events for selection.
     */
    public function getAvailableEvents(): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        if (! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado. Apenas discentes podem acessar os eventos disponíveis.'], 403);
        }

        $events = Event::whereNull('deleted_at')
            ->orderBy('nome')
            ->get(['id', 'nome', 'alias', 'tipo', 'natureza'])
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'nome' => $event->nome,
                    'alias' => $event->alias,
                    'tipo' => $event->tipo,
                    'natureza' => $event->natureza,
                ];
            });

        return response()->json($events);
    }
}
