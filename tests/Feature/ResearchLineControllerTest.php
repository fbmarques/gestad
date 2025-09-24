<?php

namespace Tests\Feature;

use App\Models\ResearchLine;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResearchLineControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['id' => 1, 'name' => 'Administrador', 'slug' => 'admin', 'description' => 'Acesso total']);
        Role::create(['id' => 2, 'name' => 'Docente', 'slug' => 'docente', 'description' => 'Professor']);
        Role::create(['id' => 3, 'name' => 'Discente', 'slug' => 'discente', 'description' => 'Estudante']);
    }

    public function test_unauthenticated_user_cannot_access_research_lines(): void
    {
        $response = $this->getJson('/api/research-lines');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_cannot_access_research_lines(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(3); // discente role

        $response = $this->actingAs($user)->getJson('/api/research-lines');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_research_lines(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $docente = User::factory()->create();
        $docente->roles()->attach(2);

        ResearchLine::create([
            'name' => 'Inteligência Artificial',
            'alias' => 'IA',
            'description' => 'Pesquisa em IA',
            'coordinator_id' => $docente->id,
        ]);

        $response = $this->actingAs($admin)->getJson('/api/research-lines');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment([
                'name' => 'Inteligência Artificial',
                'alias' => 'IA',
                'coordinator' => $docente->name,
            ]);
    }

    public function test_docente_can_list_research_lines(): void
    {
        $docente = User::factory()->create();
        $docente->roles()->attach(2);

        ResearchLine::create([
            'name' => 'Machine Learning',
            'alias' => 'ML',
            'description' => 'Estudos em ML',
        ]);

        $response = $this->actingAs($docente)->getJson('/api/research-lines');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment([
                'name' => 'Machine Learning',
                'alias' => 'ML',
                'coordinator' => 'Sem coordenador',
            ]);
    }

    public function test_admin_can_create_research_line(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $docente = User::factory()->create();
        $docente->roles()->attach(2);

        $data = [
            'name' => 'Sistemas Distribuídos',
            'alias' => 'SD',
            'description' => 'Pesquisa em sistemas distribuídos',
            'coordinator_id' => $docente->id,
        ];

        $response = $this->actingAs($admin)->postJson('/api/research-lines', $data);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Linha de pesquisa criada com sucesso.',
                'data' => [
                    'name' => 'Sistemas Distribuídos',
                    'alias' => 'SD',
                    'coordinator' => $docente->name,
                ],
            ]);

        $this->assertDatabaseHas('research_lines', [
            'name' => 'Sistemas Distribuídos',
            'alias' => 'SD',
        ]);
    }

    public function test_create_research_line_validation_fails(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $response = $this->actingAs($admin)->postJson('/api/research-lines', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'alias']);
    }

    public function test_admin_can_update_research_line(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $researchLine = ResearchLine::create([
            'name' => 'Old Name',
            'alias' => 'ON',
            'description' => 'Old description',
        ]);

        $data = [
            'name' => 'New Name',
            'alias' => 'NN',
            'description' => 'New description',
        ];

        $response = $this->actingAs($admin)->putJson("/api/research-lines/{$researchLine->id}", $data);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Linha de pesquisa atualizada com sucesso.',
                'data' => [
                    'name' => 'New Name',
                    'alias' => 'NN',
                ],
            ]);

        $this->assertDatabaseHas('research_lines', [
            'id' => $researchLine->id,
            'name' => 'New Name',
            'alias' => 'NN',
        ]);
    }

    public function test_admin_can_delete_research_line(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $researchLine = ResearchLine::create([
            'name' => 'To Delete',
            'alias' => 'TD',
        ]);

        $response = $this->actingAs($admin)->deleteJson("/api/research-lines/{$researchLine->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Linha de pesquisa excluída com sucesso.']);

        $this->assertSoftDeleted('research_lines', ['id' => $researchLine->id]);
    }

    public function test_admin_can_list_trashed_research_lines(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $researchLine = ResearchLine::create([
            'name' => 'Trashed Line',
            'alias' => 'TL',
        ]);

        $researchLine->delete();

        $response = $this->actingAs($admin)->getJson('/api/research-lines-trashed');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment([
                'name' => 'Trashed Line',
                'alias' => 'TL',
            ]);
    }

    public function test_admin_can_restore_research_line(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $researchLine = ResearchLine::create([
            'name' => 'To Restore',
            'alias' => 'TR',
        ]);

        $researchLine->delete();

        $response = $this->actingAs($admin)->postJson("/api/research-lines/{$researchLine->id}/restore");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Linha de pesquisa recuperada com sucesso.']);

        $this->assertDatabaseHas('research_lines', [
            'id' => $researchLine->id,
            'deleted_at' => null,
        ]);
    }

    public function test_admin_can_get_docentes_list(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $docente1 = User::factory()->create(['name' => 'Prof. João']);
        $docente1->roles()->attach(2);

        $docente2 = User::factory()->create(['name' => 'Prof. Maria']);
        $docente2->roles()->attach(2);

        $discente = User::factory()->create(['name' => 'Estudante']);
        $discente->roles()->attach(3);

        $response = $this->actingAs($admin)->getJson('/api/docentes');

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonFragment(['name' => 'Prof. João'])
            ->assertJsonFragment(['name' => 'Prof. Maria'])
            ->assertJsonMissing(['name' => 'Estudante']);
    }
}
