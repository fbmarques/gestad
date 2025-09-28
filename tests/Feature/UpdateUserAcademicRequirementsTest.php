<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateUserAcademicRequirementsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles for testing
        Role::factory()->create(['id' => 1, 'name' => 'admin']);
        Role::factory()->create(['id' => 2, 'name' => 'docente']);
        Role::factory()->create(['id' => 3, 'name' => 'discente']);
    }

    public function test_discente_can_get_academic_requirements_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
            'qualification_status' => 'Scheduled',
            'qualification_date' => '2024-12-01',
            'defense_status' => 'Not Scheduled',
            'work_completed' => false,
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/academic-requirements');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'academic_requirements' => [
                    'qualification_status',
                    'qualification_date',
                    'qualification_completion_date',
                    'defense_status',
                    'defense_date',
                    'defense_completion_date',
                    'work_completed',
                ]
            ])
            ->assertJson([
                'academic_requirements' => [
                    'qualification_status' => 'Scheduled',
                    'qualification_date' => '2024-12-01',
                    'defense_status' => 'Not Scheduled',
                    'work_completed' => false,
                ]
            ]);
    }

    public function test_discente_can_update_academic_requirements_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
            'qualification_status' => 'Not Scheduled',
            'defense_status' => 'Not Scheduled',
            'work_completed' => false,
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/academic-requirements', [
                'qualification_status' => 'Scheduled',
                'qualification_date' => '2024-12-15',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Requisitos acadêmicos atualizados com sucesso.',
                'academic_requirements' => [
                    'qualification_status' => 'Scheduled',
                    'qualification_date' => '2024-12-15',
                ]
            ]);

        $this->assertDatabaseHas('academic_bonds', [
            'id' => $academicBond->id,
            'qualification_status' => 'Scheduled',
        ]);

        $updatedBond = AcademicBond::find($academicBond->id);
        $this->assertEquals('2024-12-15', $updatedBond->qualification_date->format('Y-m-d'));
    }

    public function test_discente_can_complete_qualification(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
            'qualification_status' => 'Scheduled',
            'qualification_date' => '2024-11-01',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/academic-requirements', [
                'qualification_status' => 'Completed',
                'qualification_completion_date' => '2024-11-01',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Requisitos acadêmicos atualizados com sucesso.',
                'academic_requirements' => [
                    'qualification_status' => 'Completed',
                    'qualification_completion_date' => '2024-11-01',
                ]
            ]);

        $this->assertDatabaseHas('academic_bonds', [
            'id' => $academicBond->id,
            'qualification_status' => 'Completed',
        ]);

        $updatedBond = AcademicBond::find($academicBond->id);
        $this->assertEquals('2024-11-01', $updatedBond->qualification_completion_date->format('Y-m-d'));
    }

    public function test_discente_can_mark_work_as_completed(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
            'work_completed' => false,
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/academic-requirements', [
                'work_completed' => true,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Requisitos acadêmicos atualizados com sucesso.',
                'academic_requirements' => [
                    'work_completed' => true,
                ]
            ]);

        $this->assertDatabaseHas('academic_bonds', [
            'id' => $academicBond->id,
            'work_completed' => true,
        ]);
    }

    public function test_unauthenticated_user_cannot_access_academic_requirements(): void
    {
        $response = $this->getJson('/api/student/academic-requirements');
        $response->assertStatus(401);

        $response = $this->patchJson('/api/student/academic-requirements', [
            'qualification_status' => 'Scheduled',
        ]);
        $response->assertStatus(401);
    }

    public function test_non_discente_user_cannot_access_academic_requirements(): void
    {
        $docente = User::factory()->create();
        $docente->roles()->attach(2);

        $response = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/student/academic-requirements');
        $response->assertStatus(403);

        $response = $this->actingAs($docente, 'sanctum')
            ->patchJson('/api/student/academic-requirements', [
                'qualification_status' => 'Scheduled',
            ]);
        $response->assertStatus(403);
    }

    public function test_discente_without_academic_bond_gets_404(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/academic-requirements');
        $response->assertStatus(404)
            ->assertJson(['error' => 'Nenhum vínculo acadêmico ativo encontrado.']);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/academic-requirements', [
                'qualification_status' => 'Scheduled',
            ]);
        $response->assertStatus(404)
            ->assertJson(['error' => 'Nenhum vínculo acadêmico ativo encontrado.']);
    }

    public function test_validation_fails_for_invalid_qualification_status(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/academic-requirements', [
                'qualification_status' => 'InvalidStatus',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['qualification_status']);
    }

    public function test_validation_fails_for_invalid_defense_status(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/academic-requirements', [
                'defense_status' => 'InvalidStatus',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['defense_status']);
    }

    public function test_validation_fails_for_invalid_date_format(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/academic-requirements', [
                'qualification_date' => 'invalid-date',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['qualification_date']);
    }

    public function test_not_scheduled_status_clears_related_dates(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
            'qualification_status' => 'Completed',
            'qualification_date' => '2024-11-01',
            'qualification_completion_date' => '2024-11-01',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/academic-requirements', [
                'qualification_status' => 'Not Scheduled',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('academic_bonds', [
            'id' => $academicBond->id,
            'qualification_status' => 'Not Scheduled',
            'qualification_date' => null,
            'qualification_completion_date' => null,
        ]);
    }
}
