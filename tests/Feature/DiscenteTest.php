<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\Agency;
use App\Models\ResearchLine;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DiscenteTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Create basic roles
        Role::factory()->create(['id' => 1, 'name' => 'Admin', 'slug' => 'admin']);
        Role::factory()->create(['id' => 2, 'name' => 'Docente', 'slug' => 'docente']);
        Role::factory()->create(['id' => 3, 'name' => 'Discente', 'slug' => 'discente']);

        // Create basic dependencies
        Agency::factory()->create();
        ResearchLine::factory()->create();
    }

    public function test_unauthorized_user_cannot_access_discente_routes(): void
    {
        $response = $this->getJson('/api/discentes');
        $response->assertStatus(401);
    }

    public function test_discente_role_cannot_access_discente_management(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        Sanctum::actingAs($discente);

        $response = $this->getJson('/api/discentes');
        $response->assertStatus(403)
            ->assertJson(['error' => 'Acesso negado.']);
    }

    public function test_admin_can_list_discentes(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $docente = User::factory()->create();
        $docente->roles()->attach(2);

        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        // Create academic bond
        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'advisor_id' => $docente->id,
            'level' => 'master',
            'status' => 'active',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/discentes');
        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id', 'nome', 'email', 'orientador', 'orientador_id',
                    'nivel_pos_graduacao', 'mestrado_status', 'doutorado_status',
                ],
            ]);
    }

    public function test_docente_can_list_discentes(): void
    {
        $docente = User::factory()->create();
        $docente->roles()->attach(2);

        Sanctum::actingAs($docente);

        $response = $this->getJson('/api/discentes');
        $response->assertStatus(200);
    }

    public function test_admin_can_create_discente_with_master_level(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $orientador = User::factory()->create();
        $orientador->roles()->attach(2);

        Sanctum::actingAs($admin);

        $discenteData = [
            'nome' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'orientador_id' => $orientador->id,
            'nivel_pos_graduacao' => 'mestrado',
        ];

        $response = $this->postJson('/api/discentes', $discenteData);
        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'discente' => ['id', 'nome', 'email'],
            ]);

        // Verify user was created with correct role
        $createdUser = User::where('email', $discenteData['email'])->first();
        $this->assertTrue($createdUser->isDiscente());

        // Verify academic bond was created
        $academicBond = AcademicBond::where('student_id', $createdUser->id)->first();
        $this->assertNotNull($academicBond);
        $this->assertEquals('master', $academicBond->level);
        $this->assertEquals('active', $academicBond->status);
    }

    public function test_admin_can_create_discente_with_doctorate_level(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $orientador = User::factory()->create();
        $orientador->roles()->attach(2);

        Sanctum::actingAs($admin);

        $discenteData = [
            'nome' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'orientador_id' => $orientador->id,
            'nivel_pos_graduacao' => 'doutorado',
        ];

        $response = $this->postJson('/api/discentes', $discenteData);
        $response->assertStatus(201);

        $createdUser = User::where('email', $discenteData['email'])->first();
        $academicBond = AcademicBond::where('student_id', $createdUser->id)->first();
        $this->assertEquals('doctorate', $academicBond->level);
    }

    public function test_create_discente_validation_fails_with_invalid_data(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/discentes', []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nome', 'email', 'orientador_id', 'nivel_pos_graduacao']);
    }

    public function test_create_discente_validation_fails_with_duplicate_email(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $orientador = User::factory()->create();
        $orientador->roles()->attach(2);

        $existingUser = User::factory()->create();

        Sanctum::actingAs($admin);

        $discenteData = [
            'nome' => $this->faker->name,
            'email' => $existingUser->email,
            'orientador_id' => $orientador->id,
            'nivel_pos_graduacao' => 'mestrado',
        ];

        $response = $this->postJson('/api/discentes', $discenteData);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_admin_can_view_specific_discente(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $orientador = User::factory()->create();
        $orientador->roles()->attach(2);

        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'advisor_id' => $orientador->id,
            'level' => 'master',
            'status' => 'active',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson("/api/discentes/{$discente->id}");
        $response->assertStatus(200)
            ->assertJsonStructure([
                'id', 'nome', 'email', 'orientador', 'orientador_id',
                'nivel_pos_graduacao', 'mestrado_status', 'doutorado_status',
            ]);
    }

    public function test_cannot_view_non_discente_user(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $notDiscente = User::factory()->create();
        $notDiscente->roles()->attach(2); // docente role

        Sanctum::actingAs($admin);

        $response = $this->getJson("/api/discentes/{$notDiscente->id}");
        $response->assertStatus(404)
            ->assertJson(['error' => 'Usuário não é um discente.']);
    }

    public function test_admin_can_update_discente_basic_info(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $orientador = User::factory()->create();
        $orientador->roles()->attach(2);

        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'advisor_id' => $orientador->id,
            'level' => 'master',
            'status' => 'active',
        ]);

        Sanctum::actingAs($admin);

        $updateData = [
            'nome' => 'Nome Atualizado',
            'email' => 'updated@email.com',
            'orientador_id' => $orientador->id,
            'nivel_pos_graduacao' => 'mestrado',
        ];

        $response = $this->putJson("/api/discentes/{$discente->id}", $updateData);
        $response->assertStatus(200)
            ->assertJson(['message' => 'Discente atualizado com sucesso.']);

        $discente->refresh();
        $this->assertEquals('Nome Atualizado', $discente->name);
        $this->assertEquals('updated@email.com', $discente->email);
    }

    public function test_cannot_transition_from_doctorate_to_master(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $orientador = User::factory()->create();
        $orientador->roles()->attach(2);

        // Create doctorate bond
        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'advisor_id' => $orientador->id,
            'level' => 'doctorate',
            'status' => 'active',
        ]);

        Sanctum::actingAs($admin);

        $updateData = [
            'nome' => $discente->name,
            'email' => $discente->email,
            'orientador_id' => $orientador->id,
            'nivel_pos_graduacao' => 'mestrado', // Trying to downgrade
        ];

        $response = $this->putJson("/api/discentes/{$discente->id}", $updateData);
        $response->assertStatus(422)
            ->assertJson(['error' => 'Não é possível alterar de doutorado para mestrado.']);
    }

    public function test_can_transition_from_completed_master_to_doctorate(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $orientador = User::factory()->create();
        $orientador->roles()->attach(2);

        // Create completed master bond
        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'advisor_id' => $orientador->id,
            'level' => 'master',
            'status' => 'completed',
        ]);

        Sanctum::actingAs($admin);

        $updateData = [
            'nome' => $discente->name,
            'email' => $discente->email,
            'orientador_id' => $orientador->id,
            'nivel_pos_graduacao' => 'doutorado',
        ];

        $response = $this->putJson("/api/discentes/{$discente->id}", $updateData);
        $response->assertStatus(200);

        // Check that doctorate bond was created
        $doctorateBond = AcademicBond::where('student_id', $discente->id)
            ->where('level', 'doctorate')
            ->first();
        $this->assertNotNull($doctorateBond);
        $this->assertEquals('active', $doctorateBond->status);
    }

    public function test_cannot_transition_to_doctorate_without_completed_master(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $orientador = User::factory()->create();
        $orientador->roles()->attach(2);

        // Create active (not completed) master bond
        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'advisor_id' => $orientador->id,
            'level' => 'master',
            'status' => 'active',
        ]);

        Sanctum::actingAs($admin);

        $updateData = [
            'nome' => $discente->name,
            'email' => $discente->email,
            'orientador_id' => $orientador->id,
            'nivel_pos_graduacao' => 'doutorado',
        ];

        $response = $this->putJson("/api/discentes/{$discente->id}", $updateData);
        $response->assertStatus(422)
            ->assertJson(['error' => 'Não é possível iniciar doutorado sem concluir o mestrado.']);
    }

    public function test_admin_can_soft_delete_discente(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/discentes/{$discente->id}");
        $response->assertStatus(200)
            ->assertJson(['message' => 'Discente excluído com sucesso.']);

        $this->assertSoftDeleted($discente);
    }

    public function test_admin_can_list_trashed_discentes(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $discente = User::factory()->create();
        $discente->roles()->attach(3);
        $discente->delete();

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/discentes-trashed');
        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id', 'nome', 'email', 'orientador',
                    'status_mestrado', 'status_doutorado', 'data_exclusao',
                ],
            ]);
    }

    public function test_admin_can_restore_trashed_discente(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $discente = User::factory()->create();
        $discente->roles()->attach(3);
        $discente->delete();

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/discentes/{$discente->id}/restore");
        $response->assertStatus(200)
            ->assertJson(['message' => 'Discente recuperado com sucesso.']);

        $this->assertDatabaseHas('users', [
            'id' => $discente->id,
            'deleted_at' => null,
        ]);
    }

    public function test_can_get_docentes_for_dropdown(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $docente1 = User::factory()->create(['name' => 'Dr. João Silva']);
        $docente1->roles()->attach(2);

        $docente2 = User::factory()->create(['name' => 'Dra. Maria Santos']);
        $docente2->roles()->attach(2);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/docentes-dropdown');
        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'name'],
            ])
            ->assertJsonCount(2);
    }
}
