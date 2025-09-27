<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\ResearchLine;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentApiTest extends TestCase
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

    public function test_student_can_get_their_data_successfully(): void
    {
        // Create a research line
        $researchLine = ResearchLine::factory()->create([
            'name' => 'Inteligência Artificial',
        ]);

        // Create advisor user
        $advisor = User::factory()->create([
            'name' => 'Prof. Dr. João Silva',
        ]);

        // Create student user
        $student = User::factory()->create([
            'name' => 'Maria Santos',
            'email' => 'maria@example.com',
        ]);

        // Attach student role
        $student->roles()->attach(3);

        // Create academic bond
        AcademicBond::factory()->create([
            'student_id' => $student->id,
            'advisor_id' => $advisor->id,
            'research_line_id' => $researchLine->id,
            'level' => 'master',
            'status' => 'active',
            'title' => 'Pesquisa em IA',
            'description' => 'Descrição da pesquisa',
            'start_date' => now()->subMonths(6),
            'end_date' => now()->addMonths(18),
        ]);

        // Authenticate as student
        Sanctum::actingAs($student);

        // Make API request
        $response = $this->getJson('/api/student/me');

        // Assert success response with correct JSON structure
        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'email',
                'modality',
                'advisor',
                'advisor_id',
                'research_line',
                'academic_bond' => [
                    'id',
                    'level',
                    'status',
                    'start_date',
                    'end_date',
                    'title',
                    'description',
                ],
            ])
            ->assertJson([
                'name' => 'Maria Santos',
                'email' => 'maria@example.com',
                'modality' => 'Mestrado',
                'advisor' => 'Prof. Dr. João Silva',
                'research_line' => 'Inteligência Artificial',
            ]);
    }

    public function test_unauthenticated_user_cannot_access_student_data(): void
    {
        // Make API request without authentication
        $response = $this->getJson('/api/student/me');

        // Assert 401 unauthorized
        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_student_without_academic_bond_receives_404(): void
    {
        // Create student user without academic bond
        $student = User::factory()->create([
            'name' => 'João Sem Vínculo',
            'email' => 'joao@example.com',
        ]);

        // Attach student role
        $student->roles()->attach(3);

        // Authenticate as student
        Sanctum::actingAs($student);

        // Make API request
        $response = $this->getJson('/api/student/me');

        // Assert 404 not found
        $response->assertStatus(404)
            ->assertJson([
                'error' => 'Nenhum vínculo acadêmico ativo encontrado',
            ]);
    }

    public function test_student_with_inactive_academic_bond_receives_404(): void
    {
        // Create research line
        $researchLine = ResearchLine::factory()->create();

        // Create advisor user
        $advisor = User::factory()->create();

        // Create student user
        $student = User::factory()->create();

        // Attach student role
        $student->roles()->attach(3);

        // Create inactive academic bond
        AcademicBond::factory()->create([
            'student_id' => $student->id,
            'advisor_id' => $advisor->id,
            'research_line_id' => $researchLine->id,
            'level' => 'doctorate',
            'status' => 'inactive', // inactive status
        ]);

        // Authenticate as student
        Sanctum::actingAs($student);

        // Make API request
        $response = $this->getJson('/api/student/me');

        // Assert 404 not found
        $response->assertStatus(404)
            ->assertJson([
                'error' => 'Nenhum vínculo acadêmico ativo encontrado',
            ]);
    }

    public function test_doctorate_modality_is_correctly_formatted(): void
    {
        // Create research line
        $researchLine = ResearchLine::factory()->create();

        // Create advisor user
        $advisor = User::factory()->create([
            'name' => 'Prof. Dr. Ana Costa',
        ]);

        // Create student user
        $student = User::factory()->create([
            'name' => 'Pedro Silva',
        ]);

        // Attach student role
        $student->roles()->attach(3);

        // Create academic bond with doctorate level
        AcademicBond::factory()->create([
            'student_id' => $student->id,
            'advisor_id' => $advisor->id,
            'research_line_id' => $researchLine->id,
            'level' => 'doctorate',
            'status' => 'active',
        ]);

        // Authenticate as student
        Sanctum::actingAs($student);

        // Make API request
        $response = $this->getJson('/api/student/me');

        // Assert success response with correct modality formatting
        $response->assertStatus(200)
            ->assertJson([
                'modality' => 'Doutorado',
            ]);
    }
}
