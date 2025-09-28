<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\Course;
use App\Models\Role;
use App\Models\StudentCourse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentDisciplinesApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Create basic roles
        Role::factory()->create(['id' => 1, 'name' => 'Administrador', 'slug' => 'admin']);
        Role::factory()->create(['id' => 2, 'name' => 'Docente', 'slug' => 'docente']);
        Role::factory()->create(['id' => 3, 'name' => 'Discente', 'slug' => 'discente']);
    }

    public function test_student_can_get_their_disciplines_successfully(): void
    {
        // Create student user with active academic bond
        $student = User::factory()->create();
        $student->roles()->attach(3); // discente role

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $student->id,
            'level' => 'master',
            'status' => 'active',
        ]);

        // Create courses
        $course1 = Course::factory()->create(['name' => 'Algoritmos', 'code' => 'ALG001', 'credits' => 4]);
        $course2 = Course::factory()->create(['name' => 'Banco de Dados', 'code' => 'BD001', 'credits' => 3]);

        // Create docentes
        $docente1 = User::factory()->create(['name' => 'Prof. Dr. João Silva']);
        $docente1->roles()->attach(2);
        $docente2 = User::factory()->create(['name' => 'Prof. Dr. Maria Costa']);
        $docente2->roles()->attach(2);

        // Create student courses
        StudentCourse::create(['academic_bond_id' => $academicBond->id, 'course_id' => $course1->id, 'docente_id' => $docente1->id]);
        StudentCourse::create(['academic_bond_id' => $academicBond->id, 'course_id' => $course2->id, 'docente_id' => $docente2->id]);

        // Authenticate as the student
        Sanctum::actingAs($student);

        $response = $this->getJson('/api/student/disciplines');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'disciplines' => [
                    '*' => ['id', 'course_id', 'code', 'name', 'credits', 'docente', 'docente_id'],
                ],
                'credits_info' => [
                    'total_credits',
                    'required_credits',
                    'progress_percentage',
                ],
            ])
            ->assertJsonPath('disciplines.0.name', 'Algoritmos')
            ->assertJsonPath('disciplines.0.docente', 'Prof. Dr. João Silva')
            ->assertJsonPath('disciplines.1.name', 'Banco de Dados')
            ->assertJsonPath('disciplines.1.docente', 'Prof. Dr. Maria Costa')
            ->assertJsonPath('credits_info.total_credits', 7)
            ->assertJsonPath('credits_info.required_credits', 18);
    }

    public function test_student_can_add_discipline_successfully(): void
    {
        // Create student user with active academic bond
        $student = User::factory()->create();
        $student->roles()->attach(3); // discente role

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $student->id,
            'level' => 'master',
            'status' => 'active',
        ]);

        // Create course and docente
        $course = Course::factory()->create(['name' => 'Algoritmos', 'code' => 'ALG001', 'credits' => 4]);
        $docente = User::factory()->create(['name' => 'Prof. Dr. João Silva']);
        $docente->roles()->attach(2);

        // Authenticate as the student
        Sanctum::actingAs($student);

        $response = $this->postJson('/api/student/disciplines', [
            'course_id' => $course->id,
            'docente_id' => $docente->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'discipline' => ['id', 'course_id', 'code', 'name', 'credits', 'docente', 'docente_id'],
            ])
            ->assertJsonPath('discipline.name', 'Algoritmos')
            ->assertJsonPath('discipline.code', 'ALG001')
            ->assertJsonPath('discipline.docente', 'Prof. Dr. João Silva');

        // Assert the student course was created in the database
        $this->assertDatabaseHas('student_courses', [
            'academic_bond_id' => $academicBond->id,
            'course_id' => $course->id,
            'docente_id' => $docente->id,
        ]);
    }

    public function test_student_cannot_add_same_discipline_twice(): void
    {
        // Create student user with active academic bond
        $student = User::factory()->create();
        $student->roles()->attach(3); // discente role

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $student->id,
            'level' => 'master',
            'status' => 'active',
        ]);

        // Create course and docente
        $course = Course::factory()->create(['name' => 'Algoritmos', 'code' => 'ALG001', 'credits' => 4]);
        $docente = User::factory()->create(['name' => 'Prof. Dr. João Silva']);
        $docente->roles()->attach(2);

        // Add the course first time
        StudentCourse::create([
            'academic_bond_id' => $academicBond->id,
            'course_id' => $course->id,
            'docente_id' => $docente->id
        ]);

        // Authenticate as the student
        Sanctum::actingAs($student);

        $response = $this->postJson('/api/student/disciplines', [
            'course_id' => $course->id,
            'docente_id' => $docente->id,
        ]);

        $response->assertStatus(422)
            ->assertJson(['error' => 'Esta disciplina já foi adicionada.']);
    }

    public function test_student_can_remove_discipline_successfully(): void
    {
        // Create student user with active academic bond
        $student = User::factory()->create();
        $student->roles()->attach(3); // discente role

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $student->id,
            'level' => 'master',
            'status' => 'active',
        ]);

        // Create course, docente and student course
        $course = Course::factory()->create(['name' => 'Algoritmos', 'code' => 'ALG001', 'credits' => 4]);
        $docente = User::factory()->create(['name' => 'Prof. Dr. João Silva']);
        $docente->roles()->attach(2);

        $studentCourse = StudentCourse::create([
            'academic_bond_id' => $academicBond->id,
            'course_id' => $course->id,
            'docente_id' => $docente->id
        ]);

        // Authenticate as the student
        Sanctum::actingAs($student);

        $response = $this->deleteJson("/api/student/disciplines/{$studentCourse->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Disciplina removida com sucesso.']);

        // Assert the student course was deleted from the database
        $this->assertDatabaseMissing('student_courses', [
            'id' => $studentCourse->id,
        ]);
    }

    public function test_student_can_get_available_courses(): void
    {
        // Create student user
        $student = User::factory()->create();
        $student->roles()->attach(3); // discente role

        // Create courses
        $course1 = Course::factory()->create(['name' => 'Algoritmos', 'code' => 'ALG001', 'credits' => 4]);
        $course2 = Course::factory()->create(['name' => 'Banco de Dados', 'code' => 'BD001', 'credits' => 3]);

        // Authenticate as the student
        Sanctum::actingAs($student);

        $response = $this->getJson('/api/student/available-courses');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'code', 'name', 'credits'],
            ])
            ->assertJsonCount(2);
    }

    public function test_student_can_get_available_teachers(): void
    {
        // Create student user
        $student = User::factory()->create();
        $student->roles()->attach(3); // discente role

        // Create teachers (docentes)
        $teacher1 = User::factory()->create(['name' => 'Prof. Dr. João Silva']);
        $teacher1->roles()->attach(2); // docente role

        $teacher2 = User::factory()->create(['name' => 'Prof. Dr. Maria Costa']);
        $teacher2->roles()->attach(2); // docente role

        // Authenticate as the student
        Sanctum::actingAs($student);

        $response = $this->getJson('/api/student/available-teachers');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'name'],
            ])
            ->assertJsonCount(2);
    }

    public function test_unauthenticated_user_cannot_access_disciplines(): void
    {
        $response = $this->getJson('/api/student/disciplines');
        $response->assertStatus(401);
    }

    public function test_non_student_user_cannot_access_disciplines(): void
    {
        // Create docente user
        $docente = User::factory()->create();
        $docente->roles()->attach(2); // docente role

        // Authenticate as the docente
        Sanctum::actingAs($docente);

        $response = $this->getJson('/api/student/disciplines');
        $response->assertStatus(403);
    }

    public function test_add_discipline_validation_fails_for_invalid_course_id(): void
    {
        // Create student user with active academic bond
        $student = User::factory()->create();
        $student->roles()->attach(3); // discente role

        AcademicBond::factory()->create([
            'student_id' => $student->id,
            'level' => 'master',
            'status' => 'active',
        ]);

        // Authenticate as the student
        Sanctum::actingAs($student);

        $response = $this->postJson('/api/student/disciplines', [
            'course_id' => 999, // non-existent course
            'docente_id' => 1, // valid docente_id but invalid course_id
        ]);

        $response->assertStatus(422);
    }

    public function test_add_discipline_validation_fails_for_invalid_docente_id(): void
    {
        // Create student user with active academic bond
        $student = User::factory()->create();
        $student->roles()->attach(3); // discente role

        AcademicBond::factory()->create([
            'student_id' => $student->id,
            'level' => 'master',
            'status' => 'active',
        ]);

        // Create valid course
        $course = Course::factory()->create(['name' => 'Algoritmos', 'code' => 'ALG001', 'credits' => 4]);

        // Authenticate as the student
        Sanctum::actingAs($student);

        $response = $this->postJson('/api/student/disciplines', [
            'course_id' => $course->id, // valid course
            'docente_id' => 999, // non-existent docente
        ]);

        $response->assertStatus(422);
    }
}
