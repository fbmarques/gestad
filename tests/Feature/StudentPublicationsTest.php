<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\Journal;
use App\Models\Publication;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentPublicationsTest extends TestCase
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

    public function test_discente_can_get_publications_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $journal = Journal::factory()->create();

        $publication = Publication::factory()->create([
            'academic_bond_id' => $academicBond->id,
            'journal_id' => $journal->id,
            'title' => 'Test Publication',
            'submission_date' => '2024-01-15',
            'status' => 'S',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/publications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'title',
                    'journal',
                    'journal_id',
                    'submission_date',
                    'approval_date',
                    'publication_date',
                    'status',
                    'status_display',
                    'can_select_for_pdf',
                ],
            ]);
    }

    public function test_discente_can_add_publication_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $journal = Journal::factory()->create();

        $response = $this->actingAs($discente, 'sanctum')
            ->postJson('/api/student/publications', [
                'journal_id' => $journal->id,
                'title' => 'Nova Publicação de Teste',
                'submission_date' => '2024-01-15',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Publicação adicionada com sucesso.']);

        $this->assertDatabaseHas('publications', [
            'academic_bond_id' => $academicBond->id,
            'journal_id' => $journal->id,
            'title' => 'Nova Publicação de Teste',
            'submission_date' => '2024-01-15 00:00:00',
            'status' => 'S',
        ]);
    }

    public function test_discente_can_update_publication_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $journal = Journal::factory()->create();

        $publication = Publication::factory()->create([
            'academic_bond_id' => $academicBond->id,
            'journal_id' => $journal->id,
            'title' => 'Test Publication',
            'submission_date' => '2024-01-15',
            'status' => 'S',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson("/api/student/publications/{$publication->id}", [
                'approval_date' => '2024-02-15',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Publicação atualizada com sucesso.']);

        $this->assertDatabaseHas('publications', [
            'id' => $publication->id,
            'approval_date' => '2024-02-15 00:00:00',
            'status' => 'A', // Should update to approved when approval_date is set
        ]);
    }

    public function test_discente_can_remove_publication_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $journal = Journal::factory()->create();

        $publication = Publication::factory()->create([
            'academic_bond_id' => $academicBond->id,
            'journal_id' => $journal->id,
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->deleteJson("/api/student/publications/{$publication->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Publicação removida com sucesso.']);

        $this->assertDatabaseMissing('publications', [
            'id' => $publication->id,
        ]);
    }

    public function test_discente_can_get_available_journals_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        Journal::factory()->create(['name' => 'Test Journal 1']);
        Journal::factory()->create(['name' => 'Test Journal 2']);

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/available-journals');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name',
                    'qualis',
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_publications(): void
    {
        $response = $this->getJson('/api/student/publications');
        $response->assertStatus(401);

        $response = $this->postJson('/api/student/publications', []);
        $response->assertStatus(401);

        $response = $this->getJson('/api/student/available-journals');
        $response->assertStatus(401);
    }

    public function test_non_discente_user_cannot_access_publications(): void
    {
        $docente = User::factory()->create();
        $docente->roles()->attach(2); // docente role

        $response = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/student/publications');
        $response->assertStatus(403);

        $response = $this->actingAs($docente, 'sanctum')
            ->postJson('/api/student/publications', []);
        $response->assertStatus(403);
    }

    public function test_validation_fails_for_invalid_publication_data(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        // Test missing required fields
        $response = $this->actingAs($discente, 'sanctum')
            ->postJson('/api/student/publications', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['journal_id', 'title', 'submission_date']);

        // Test invalid journal_id
        $response = $this->actingAs($discente, 'sanctum')
            ->postJson('/api/student/publications', [
                'journal_id' => 999,
                'title' => 'Test',
                'submission_date' => '2024-01-15',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['journal_id']);
    }

    public function test_discente_without_active_academic_bond_cannot_manage_publications(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        // No academic bond created

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/publications');

        $response->assertStatus(404)
            ->assertJson(['error' => 'Nenhum vínculo acadêmico ativo encontrado.']);
    }

    public function test_discente_cannot_update_another_students_publication(): void
    {
        $discente1 = User::factory()->create();
        $discente1->roles()->attach(3);

        $discente2 = User::factory()->create();
        $discente2->roles()->attach(3);

        $academicBond1 = AcademicBond::factory()->create([
            'student_id' => $discente1->id,
            'status' => 'active',
        ]);

        $academicBond2 = AcademicBond::factory()->create([
            'student_id' => $discente2->id,
            'status' => 'active',
        ]);

        $journal = Journal::factory()->create();

        $publication = Publication::factory()->create([
            'academic_bond_id' => $academicBond2->id,
            'journal_id' => $journal->id,
            'submission_date' => '2024-01-01', // Ensure submission date is before approval date
        ]);

        $response = $this->actingAs($discente1, 'sanctum')
            ->patchJson("/api/student/publications/{$publication->id}", [
                'approval_date' => '2024-02-15',
            ]);

        $response->assertStatus(404)
            ->assertJson(['error' => 'Publicação não encontrada ou não pertence a este discente.']);
    }
}
