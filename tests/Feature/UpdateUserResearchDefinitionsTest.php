<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateUserResearchDefinitionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::factory()->create(['id' => 1, 'name' => 'admin']);
        Role::factory()->create(['id' => 2, 'name' => 'docente']);
        Role::factory()->create(['id' => 3, 'name' => 'discente']);
    }

    public function test_discente_can_get_research_definitions_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3); // Discente role

        // Create academic bond for the student
        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
            'problem_defined' => true,
            'problem_text' => 'Este é o problema de pesquisa',
            'question_defined' => false,
            'question_text' => null,
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/research-definitions');

        $response->assertStatus(200)
            ->assertJson([
                'research_definitions' => [
                    'problem_defined' => true,
                    'problem_text' => 'Este é o problema de pesquisa',
                    'question_defined' => false,
                    'question_text' => null,
                ],
            ]);
    }

    public function test_discente_can_update_research_definitions_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3); // Discente role

        // Create academic bond for the student
        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $data = [
            'problem_defined' => true,
            'problem_text' => 'Este é o problema de pesquisa que será resolvido',
            'question_defined' => true,
            'question_text' => 'Qual é a pergunta principal da pesquisa?',
        ];

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/research-definitions', $data);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Definições de pesquisa atualizadas com sucesso.',
                'research_definitions' => [
                    'problem_defined' => true,
                    'problem_text' => 'Este é o problema de pesquisa que será resolvido',
                    'question_defined' => true,
                    'question_text' => 'Qual é a pergunta principal da pesquisa?',
                ],
            ]);

        $this->assertDatabaseHas('academic_bonds', [
            'id' => $academicBond->id,
            'problem_defined' => true,
            'problem_text' => 'Este é o problema de pesquisa que será resolvido',
            'question_defined' => true,
            'question_text' => 'Qual é a pergunta principal da pesquisa?',
        ]);
    }

    public function test_discente_can_deactivate_research_definition(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3); // Discente role

        // Create academic bond with existing definitions
        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
            'problem_defined' => true,
            'problem_text' => 'Problema existente',
        ]);

        $data = [
            'problem_defined' => false,
            'problem_text' => null,
        ];

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/research-definitions', $data);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Definições de pesquisa atualizadas com sucesso.',
                'research_definitions' => [
                    'problem_defined' => false,
                    'problem_text' => null,
                ],
            ]);

        $this->assertDatabaseHas('academic_bonds', [
            'id' => $academicBond->id,
            'problem_defined' => false,
            'problem_text' => null,
        ]);
    }

    public function test_unauthenticated_user_cannot_access_research_definitions(): void
    {
        $response = $this->getJson('/api/student/research-definitions');
        $response->assertStatus(401);

        $response = $this->patchJson('/api/student/research-definitions', [
            'problem_defined' => true,
            'problem_text' => 'Test',
        ]);
        $response->assertStatus(401);
    }

    public function test_non_discente_user_cannot_access_research_definitions(): void
    {
        $docente = User::factory()->create();
        $docente->roles()->attach(2); // Docente role

        $response = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/student/research-definitions');
        $response->assertStatus(403)
            ->assertJson(['error' => 'Acesso negado. Apenas discentes podem acessar definições de pesquisa.']);

        $response = $this->actingAs($docente, 'sanctum')
            ->patchJson('/api/student/research-definitions', [
                'problem_defined' => true,
                'problem_text' => 'Test',
            ]);
        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);
    }

    public function test_validation_fails_for_invalid_text_length(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3); // Discente role

        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $data = [
            'problem_text' => str_repeat('a', 65536), // Exceeds max length
        ];

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/research-definitions', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['problem_text']);
    }

    public function test_validation_fails_for_invalid_boolean_values(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3); // Discente role

        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $data = [
            'problem_defined' => 'invalid_boolean',
        ];

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/research-definitions', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['problem_defined']);
    }

    public function test_error_when_no_active_academic_bond_exists(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3); // Discente role

        // No academic bond created

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/research-definitions');
        $response->assertStatus(404)
            ->assertJson(['error' => 'Nenhum vínculo acadêmico ativo encontrado.']);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/research-definitions', [
                'problem_defined' => true,
                'problem_text' => 'Test',
            ]);
        $response->assertStatus(404)
            ->assertJson(['error' => 'Nenhum vínculo acadêmico ativo encontrado.']);
    }

    public function test_all_research_definitions_fields_can_be_updated(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3); // Discente role

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $data = [
            'problem_defined' => true,
            'problem_text' => 'Problema de pesquisa definido',
            'question_defined' => true,
            'question_text' => 'Pergunta de pesquisa definida',
            'objectives_defined' => true,
            'objectives_text' => 'Objetivos da pesquisa definidos',
            'methodology_defined' => true,
            'methodology_text' => 'Metodologia da pesquisa definida',
        ];

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/student/research-definitions', $data);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Definições de pesquisa atualizadas com sucesso.',
                'research_definitions' => $data,
            ]);

        $this->assertDatabaseHas('academic_bonds', array_merge(
            ['id' => $academicBond->id],
            $data
        ));
    }
}
