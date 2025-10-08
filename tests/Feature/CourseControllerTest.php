<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    private User $docenteUser;

    private User $discenteUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminRole = Role::create(['id' => 1, 'slug' => 'admin', 'name' => 'Administrator']);
        $docenteRole = Role::create(['id' => 2, 'slug' => 'docente', 'name' => 'Docente']);
        $discenteRole = Role::create(['id' => 3, 'slug' => 'discente', 'name' => 'Discente']);

        // Create users and assign roles
        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach($adminRole->id);

        $this->docenteUser = User::factory()->create();
        $this->docenteUser->roles()->attach($docenteRole->id);

        $this->discenteUser = User::factory()->create();
        $this->discenteUser->roles()->attach($discenteRole->id);
    }

    public function test_admin_can_list_courses(): void
    {
        Course::factory()->count(3)->create();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/courses');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_docente_can_list_courses(): void
    {
        Course::factory()->count(2)->create();

        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->getJson('/api/courses');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_discente_cannot_list_courses(): void
    {
        $response = $this->actingAs($this->discenteUser, 'sanctum')
            ->getJson('/api/courses');

        $response->assertStatus(403)
            ->assertJson(['error' => 'Acesso negado.']);
    }

    public function test_unauthenticated_user_cannot_list_courses(): void
    {
        $response = $this->getJson('/api/courses');

        $response->assertStatus(401);
    }

    public function test_admin_can_create_course(): void
    {
        $courseData = [
            'code' => 'CS101',
            'name' => 'Introduction to Computer Science',
            'description' => 'Basic concepts of computer science',
            'credits' => 4,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/courses', $courseData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Disciplina criada com sucesso.',
                'data' => [
                    'code' => 'CS101',
                    'name' => 'Introduction to Computer Science',
                    'credits' => 4,
                ],
            ]);

        $this->assertDatabaseHas('courses', $courseData);
    }

    public function test_docente_can_create_course(): void
    {
        $courseData = [
            'code' => 'MAT101',
            'name' => 'Calculus I',
            'credits' => 5,
        ];

        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->postJson('/api/courses', $courseData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('courses', $courseData);
    }

    public function test_discente_cannot_create_course(): void
    {
        $courseData = [
            'code' => 'CS101',
            'name' => 'Introduction to Computer Science',
            'credits' => 4,
        ];

        $response = $this->actingAs($this->discenteUser, 'sanctum')
            ->postJson('/api/courses', $courseData);

        $response->assertStatus(403);
    }

    public function test_course_creation_requires_valid_data(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/courses', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code', 'name', 'credits']);
    }

    public function test_course_creation_requires_unique_code(): void
    {
        Course::factory()->create(['code' => 'CS101']);

        $courseData = [
            'code' => 'CS101',
            'name' => 'Another Course',
            'credits' => 3,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/courses', $courseData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    public function test_admin_can_update_course(): void
    {
        $course = Course::factory()->create([
            'code' => 'CS101',
            'name' => 'Old Name',
            'credits' => 3,
        ]);

        $updateData = [
            'code' => 'CS102',
            'name' => 'New Name',
            'credits' => 4,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/courses/{$course->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Disciplina atualizada com sucesso.',
                'data' => [
                    'code' => 'CS102',
                    'name' => 'New Name',
                    'credits' => 4,
                ],
            ]);

        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'code' => 'CS102',
            'name' => 'New Name',
            'credits' => 4,
        ]);
    }

    public function test_admin_can_delete_course(): void
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/courses/{$course->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Disciplina excluída com sucesso.']);

        $this->assertSoftDeleted('courses', ['id' => $course->id]);
    }

    public function test_admin_can_view_trashed_courses(): void
    {
        $activeCourse = Course::factory()->create(['name' => 'Active Course']);
        $trashedCourse = Course::factory()->create(['name' => 'Trashed Course']);
        $trashedCourse->delete();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/courses-trashed');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['name' => 'Trashed Course'])
            ->assertJsonMissing(['name' => 'Active Course']);
    }

    public function test_admin_can_restore_trashed_course(): void
    {
        $course = Course::factory()->create();
        $course->delete();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/courses/{$course->id}/restore");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Disciplina restaurada com sucesso.']);

        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'deleted_at' => null,
        ]);
    }

    public function test_discente_cannot_delete_course(): void
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->discenteUser, 'sanctum')
            ->deleteJson("/api/courses/{$course->id}");

        $response->assertStatus(403)
            ->assertJson(['error' => 'Acesso negado.']);

        $this->assertDatabaseHas('courses', ['id' => $course->id]);
    }

    public function test_course_update_allows_same_code_for_same_course(): void
    {
        $course = Course::factory()->create(['code' => 'CS101']);

        $updateData = [
            'code' => 'CS101', // Same code should be allowed
            'name' => 'Updated Name',
            'credits' => 5,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/courses/{$course->id}", $updateData);

        $response->assertStatus(200);
    }

    public function test_course_credits_must_be_within_valid_range(): void
    {
        // Test minimum credits
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/courses', [
                'code' => 'CS101',
                'name' => 'Test Course',
                'credits' => 0, // Below minimum
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['credits']);

        // Test maximum credits
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/courses', [
                'code' => 'CS102',
                'name' => 'Test Course',
                'credits' => 11, // Above maximum
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['credits']);

        // Test valid credits
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/courses', [
                'code' => 'CS103',
                'name' => 'Test Course',
                'credits' => 4, // Valid
            ]);

        $response->assertStatus(201);
    }
}
