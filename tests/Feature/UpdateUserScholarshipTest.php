<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\Agency;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateUserScholarshipTest extends TestCase
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

    public function test_discente_can_get_agencies(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        // Create some agencies
        $agency1 = Agency::factory()->create();
        $agency2 = Agency::factory()->create();

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/agencies');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'name', 'alias'],
            ])
            ->assertJsonFragment(['id' => $agency1->id])
            ->assertJsonFragment(['id' => $agency2->id]);
    }

    public function test_discente_can_get_scholarship_info(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $agency = Agency::factory()->create();

        // Create academic bond with agency
        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'agency_id' => $agency->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/scholarship');

        $response->assertStatus(200)
            ->assertJson([
                'is_scholarship_holder' => true,
                'agency' => [
                    'id' => $agency->id,
                    'name' => $agency->name,
                    'alias' => $agency->alias,
                ],
            ]);
    }

    public function test_discente_can_get_scholarship_info_when_no_agency(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        // Create academic bond without agency
        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'agency_id' => null,
            'status' => 'active',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/scholarship');

        $response->assertStatus(200)
            ->assertJson([
                'is_scholarship_holder' => false,
                'agency' => null,
            ]);
    }

    public function test_discente_can_update_scholarship_with_agency(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $agency = Agency::factory()->create();

        // Create academic bond without agency
        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'agency_id' => null,
            'status' => 'active',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/scholarship', [
                'agency_id' => $agency->id,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Agência de fomento selecionada com sucesso.',
                'scholarship' => [
                    'is_scholarship_holder' => true,
                    'agency' => [
                        'id' => $agency->id,
                        'name' => $agency->name,
                        'alias' => $agency->alias,
                    ],
                ],
            ]);

        $this->assertDatabaseHas('academic_bonds', [
            'id' => $academicBond->id,
            'agency_id' => $agency->id,
        ]);
    }

    public function test_discente_can_remove_scholarship(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $agency = Agency::factory()->create();

        // Create academic bond with agency
        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'agency_id' => $agency->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/scholarship', [
                'agency_id' => null,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Informação de bolsa removida com sucesso.',
                'scholarship' => [
                    'is_scholarship_holder' => false,
                    'agency' => null,
                ],
            ]);

        $this->assertDatabaseHas('academic_bonds', [
            'id' => $academicBond->id,
            'agency_id' => null,
        ]);
    }

    public function test_unauthenticated_user_cannot_access_scholarship_endpoints(): void
    {
        $response1 = $this->getJson('/api/student/agencies');
        $response1->assertStatus(401);

        $response2 = $this->getJson('/api/student/scholarship');
        $response2->assertStatus(401);

        $response3 = $this->patchJson('/api/student/scholarship', ['agency_id' => 1]);
        $response3->assertStatus(401);
    }

    public function test_non_discente_user_cannot_access_scholarship_endpoints(): void
    {
        $docente = User::factory()->create();
        $docente->roles()->attach(2);

        $response1 = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/student/agencies');
        $response1->assertStatus(403);

        $response2 = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/student/scholarship');
        $response2->assertStatus(403);

        $response3 = $this->actingAs($docente, 'sanctum')
            ->patchJson('/api/student/scholarship', ['agency_id' => 1]);
        $response3->assertStatus(403);
    }

    public function test_validation_fails_for_invalid_agency_id(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        // Create academic bond
        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/scholarship', [
                'agency_id' => 999, // Non-existent agency
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['agency_id']);
    }

    public function test_discente_without_active_academic_bond_cannot_access_scholarship(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        // No academic bond created

        $response1 = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/scholarship');
        $response1->assertStatus(404);

        $response2 = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/scholarship', ['agency_id' => null]);
        $response2->assertStatus(404);
    }
}
