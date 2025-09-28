<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateAcademicBondLinkPeriodTest extends TestCase
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

    public function test_discente_can_get_link_period_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
            'start_date' => '2024-03-01',
            'end_date' => '2026-02-28',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/link-period');

        $response->assertStatus(200)
            ->assertJson([
                'academic_bond' => [
                    'start_date' => '2024-03-01',
                    'end_date' => '2026-02-28',
                ],
            ]);
    }

    public function test_discente_can_update_link_period_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
            'start_date' => null,
            'end_date' => null,
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/link-period', [
                'start_date' => '2024-03-01',
                'end_date' => '2026-02-28',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Período de vínculo atualizado com sucesso.',
                'academic_bond' => [
                    'start_date' => '2024-03-01',
                    'end_date' => '2026-02-28',
                ],
            ]);

        $this->assertDatabaseHas('academic_bonds', [
            'id' => $academicBond->id,
            'start_date' => '2024-03-01 00:00:00',
            'end_date' => '2026-02-28 00:00:00',
        ]);
    }

    public function test_discente_can_update_single_date_field(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
            'start_date' => '2024-03-01',
            'end_date' => null,
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/link-period', [
                'end_date' => '2026-02-28',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Período de vínculo atualizado com sucesso.',
                'academic_bond' => [
                    'start_date' => '2024-03-01',
                    'end_date' => '2026-02-28',
                ],
            ]);

        $this->assertDatabaseHas('academic_bonds', [
            'id' => $academicBond->id,
            'start_date' => '2024-03-01 00:00:00',
            'end_date' => '2026-02-28 00:00:00',
        ]);
    }

    public function test_unauthenticated_user_cannot_access_link_period(): void
    {
        $response = $this->getJson('/api/student/link-period');
        $response->assertStatus(401);

        $response = $this->patchJson('/api/student/link-period', [
            'start_date' => '2024-03-01',
        ]);
        $response->assertStatus(401);
    }

    public function test_non_discente_user_cannot_access_link_period(): void
    {
        $docente = User::factory()->create();
        $docente->roles()->attach(2);

        $response = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/student/link-period');

        $response->assertStatus(403)
            ->assertJson([
                'error' => 'Acesso negado. Apenas discentes podem acessar o período de vínculo.',
            ]);

        $response = $this->actingAs($docente, 'sanctum')
            ->patchJson('/api/student/link-period', [
                'start_date' => '2024-03-01',
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'This action is unauthorized.',
            ]);
    }

    public function test_discente_without_active_bond_gets_404(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/link-period');

        $response->assertStatus(404)
            ->assertJson([
                'error' => 'Nenhum vínculo acadêmico ativo encontrado.',
            ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/link-period', [
                'start_date' => '2024-03-01',
                'end_date' => '2026-02-28',
            ]);

        $response->assertStatus(404)
            ->assertJson([
                'error' => 'Nenhum vínculo acadêmico ativo encontrado.',
            ]);
    }

    public function test_validation_fails_for_invalid_dates(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/link-period', [
                'start_date' => 'invalid-date',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_date']);
    }

    public function test_validation_fails_when_start_date_after_end_date(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/link-period', [
                'start_date' => '2026-03-01',
                'end_date' => '2024-02-28',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_date']);
    }
}
