<?php

namespace Tests\Feature;

use App\Models\ResearchLine;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DocenteTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $docenteUser;

    protected User $studentUser;

    protected ResearchLine $researchLine;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['id' => 1, 'name' => 'Administrador', 'slug' => 'admin']);
        Role::create(['id' => 2, 'name' => 'Docente', 'slug' => 'docente']);
        Role::create(['id' => 3, 'name' => 'Discente', 'slug' => 'discente']);

        // Create research line
        $this->researchLine = ResearchLine::create([
            'name' => 'Inteligência Artificial',
            'alias' => 'IA',
            'description' => 'Linha de pesquisa em IA',
        ]);

        // Create admin user
        $this->adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => 'password123',
        ]);
        $this->adminUser->roles()->attach(1);

        // Create docente user
        $this->docenteUser = User::create([
            'name' => 'Docente User',
            'email' => 'docente@test.com',
            'password' => 'password123',
            'research_line_id' => $this->researchLine->id,
        ]);
        $this->docenteUser->roles()->attach(2);

        // Create student user (unauthorized)
        $this->studentUser = User::create([
            'name' => 'Student User',
            'email' => 'student@test.com',
            'password' => 'password123',
        ]);
        $this->studentUser->roles()->attach(3);
    }

    public function test_admin_can_list_docentes()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')->getJson('/api/docentes');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'nome',
                    'email',
                    'linhaPesquisa',
                    'research_line_id',
                    'is_admin',
                ],
            ]);
    }

    public function test_docente_can_list_docentes()
    {
        $response = $this->actingAs($this->docenteUser, 'sanctum')->getJson('/api/docentes');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'nome',
                    'email',
                    'linhaPesquisa',
                    'research_line_id',
                    'is_admin',
                ],
            ]);
    }

    public function test_unauthorized_user_cannot_list_docentes()
    {
        $response = $this->actingAs($this->studentUser, 'sanctum')->getJson('/api/docentes');

        $response->assertStatus(403)
            ->assertJson(['error' => 'Acesso negado.']);
    }

    public function test_unauthenticated_user_cannot_list_docentes()
    {
        $response = $this->getJson('/api/docentes');

        $response->assertStatus(401);
    }

    public function test_admin_can_create_docente()
    {
        $docenteData = [
            'nome' => 'Novo Docente',
            'email' => 'novo.docente@test.com',
            'research_line_id' => $this->researchLine->id,
            'is_admin' => false,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')->postJson('/api/docentes', $docenteData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'docente' => [
                    'id',
                    'nome',
                    'email',
                    'linhaPesquisa',
                    'research_line_id',
                    'is_admin',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Novo Docente',
            'email' => 'novo.docente@test.com',
            'research_line_id' => $this->researchLine->id,
        ]);

        // Check if docente role was assigned
        $user = User::where('email', 'novo.docente@test.com')->first();
        $this->assertTrue($user->isDocente());
        $this->assertFalse($user->isAdmin());
    }

    public function test_admin_can_create_docente_with_admin_role()
    {
        $docenteData = [
            'nome' => 'Novo Docente Admin',
            'email' => 'novo.admin@test.com',
            'research_line_id' => $this->researchLine->id,
            'is_admin' => true,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')->postJson('/api/docentes', $docenteData);

        $response->assertStatus(201);

        $user = User::where('email', 'novo.admin@test.com')->first();
        $this->assertTrue($user->isDocente());
        $this->assertTrue($user->isAdmin());
    }

    public function test_create_docente_validation_required_fields()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')->postJson('/api/docentes', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nome', 'email', 'research_line_id']);
    }

    public function test_create_docente_validation_unique_email()
    {
        $docenteData = [
            'nome' => 'Novo Docente',
            'email' => $this->docenteUser->email, // Existing email
            'research_line_id' => $this->researchLine->id,
            'is_admin' => false,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')->postJson('/api/docentes', $docenteData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_create_docente_validation_nonexistent_research_line()
    {
        $docenteData = [
            'nome' => 'Novo Docente',
            'email' => 'novo@test.com',
            'research_line_id' => 999, // Non-existent ID
            'is_admin' => false,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')->postJson('/api/docentes', $docenteData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['research_line_id']);
    }

    public function test_admin_can_show_docente()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')->getJson("/api/docentes/{$this->docenteUser->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'nome',
                'email',
                'linhaPesquisa',
                'research_line_id',
                'is_admin',
            ])
            ->assertJson([
                'id' => $this->docenteUser->id,
                'nome' => $this->docenteUser->name,
                'email' => $this->docenteUser->email,
            ]);
    }

    public function test_show_non_docente_user_returns_404()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')->getJson("/api/docentes/{$this->studentUser->id}");

        $response->assertStatus(404)
            ->assertJson(['error' => 'Usuário não é um docente.']);
    }

    public function test_admin_can_update_docente()
    {
        $updateData = [
            'nome' => 'Nome Atualizado',
            'email' => 'email.atualizado@test.com',
            'research_line_id' => $this->researchLine->id,
            'is_admin' => true,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')->putJson("/api/docentes/{$this->docenteUser->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'docente' => [
                    'id',
                    'nome',
                    'email',
                    'linhaPesquisa',
                    'research_line_id',
                    'is_admin',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $this->docenteUser->id,
            'name' => 'Nome Atualizado',
            'email' => 'email.atualizado@test.com',
        ]);

        // Check if admin role was added
        $this->docenteUser->refresh();
        $this->assertTrue($this->docenteUser->isAdmin());
    }

    public function test_update_docente_validation_unique_email()
    {
        $updateData = [
            'nome' => 'Nome Atualizado',
            'email' => $this->adminUser->email, // Existing email
            'research_line_id' => $this->researchLine->id,
            'is_admin' => false,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')->putJson("/api/docentes/{$this->docenteUser->id}", $updateData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_admin_can_delete_docente()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')->deleteJson("/api/docentes/{$this->docenteUser->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Docente excluído com sucesso.']);

        $this->assertSoftDeleted('users', ['id' => $this->docenteUser->id]);
    }

    public function test_admin_can_list_trashed_docentes()
    {
        // Soft delete a docente
        $this->docenteUser->delete();

        $response = $this->actingAs($this->adminUser, 'sanctum')->getJson('/api/docentes-trashed');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'nome',
                    'email',
                    'linhaPesquisa',
                    'research_line_id',
                    'is_admin',
                    'dataExclusao',
                ],
            ])
            ->assertJsonFragment([
                'id' => $this->docenteUser->id,
                'nome' => $this->docenteUser->name,
            ]);
    }

    public function test_admin_can_restore_docente()
    {
        // Soft delete a docente
        $this->docenteUser->delete();

        $response = $this->actingAs($this->adminUser, 'sanctum')->postJson("/api/docentes/{$this->docenteUser->id}/restore");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Docente recuperado com sucesso.']);

        $this->assertDatabaseHas('users', [
            'id' => $this->docenteUser->id,
            'deleted_at' => null,
        ]);
    }

    public function test_restore_nonexistent_trashed_docente_returns_404()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')->postJson('/api/docentes/999/restore');

        $response->assertStatus(404)
            ->assertJson(['error' => 'Docente excluído não encontrado.']);
    }

    public function test_admin_can_get_research_lines_dropdown()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')->getJson('/api/research-lines-dropdown');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name',
                ],
            ])
            ->assertJsonFragment([
                'id' => $this->researchLine->id,
                'name' => $this->researchLine->name,
            ]);
    }

    public function test_unauthorized_user_cannot_access_any_endpoints()
    {
        $testData = [
            'nome' => 'Test',
            'email' => 'test@test.com',
            'research_line_id' => $this->researchLine->id,
        ];

        // Test GET endpoints
        $getEndpoints = ['/api/docentes', '/api/docentes-trashed', '/api/research-lines-dropdown'];
        foreach ($getEndpoints as $url) {
            $response = $this->actingAs($this->studentUser, 'sanctum')->getJson($url);
            $response->assertStatus(403, "Failed for GET {$url}")
                ->assertJson(['error' => 'Acesso negado.']);
        }

        // Test POST endpoints (Form Request authorization)
        $response = $this->actingAs($this->studentUser, 'sanctum')->postJson('/api/docentes', $testData);
        $response->assertStatus(403, 'Failed for POST /api/docentes');

        // Test PUT endpoints (Form Request authorization)
        $response = $this->actingAs($this->studentUser, 'sanctum')->putJson("/api/docentes/{$this->docenteUser->id}", $testData);
        $response->assertStatus(403, "Failed for PUT /api/docentes/{$this->docenteUser->id}");

        // Test DELETE endpoints (Controller authorization)
        $response = $this->actingAs($this->studentUser, 'sanctum')->deleteJson("/api/docentes/{$this->docenteUser->id}");
        $response->assertStatus(403, "Failed for DELETE /api/docentes/{$this->docenteUser->id}")
            ->assertJson(['error' => 'Acesso negado.']);
    }

    public function test_admin_can_reset_docente_password()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/docentes/{$this->docenteUser->id}/reset-password");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Senha resetada com sucesso.',
            ]);

        // Verify password was actually updated
        $this->docenteUser->refresh();
        $this->assertTrue(Hash::check('123321', $this->docenteUser->password));
    }

    public function test_docente_can_reset_other_docente_password()
    {
        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->postJson("/api/docentes/{$this->docenteUser->id}/reset-password");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Senha resetada com sucesso.',
            ]);
    }

    public function test_reset_password_for_non_docente_returns_404()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/docentes/{$this->studentUser->id}/reset-password");

        $response->assertStatus(404)
            ->assertJson([
                'error' => 'Usuário não é um docente.',
            ]);
    }

    public function test_unauthorized_user_cannot_reset_docente_password()
    {
        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->postJson("/api/docentes/{$this->docenteUser->id}/reset-password");

        $response->assertStatus(403)
            ->assertJson(['error' => 'Acesso negado.']);
    }

    public function test_unauthenticated_user_cannot_reset_docente_password()
    {
        $response = $this->postJson("/api/docentes/{$this->docenteUser->id}/reset-password");
        $response->assertStatus(401);
    }

    public function test_create_docente_uses_default_password_123321()
    {
        $data = [
            'nome' => 'Test Docente Password',
            'email' => 'password@test.com',
            'research_line_id' => $this->researchLine->id,
            'is_admin' => false,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/docentes', $data);

        $response->assertStatus(201);

        $createdDocente = User::where('email', 'password@test.com')->first();
        $this->assertNotNull($createdDocente);
        $this->assertTrue(Hash::check('123321', $createdDocente->password));
    }
}
