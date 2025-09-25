<?php

namespace Tests\Feature;

use App\Models\Journal;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JournalTest extends TestCase
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

    public function test_unauthenticated_user_cannot_access_journals(): void
    {
        $response = $this->getJson('/api/journals');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_cannot_access_journals(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(3); // discente role

        $response = $this->actingAs($user)->getJson('/api/journals');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_journals(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        Journal::create([
            'name' => 'Test Journal',
            'institution' => 'Test Institution',
            'qualis' => 'A1',
            'issn' => '1234-5678',
            'type' => 'international',
        ]);

        $response = $this->actingAs($admin)->getJson('/api/journals');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment([
                'nome' => 'Test Journal',
                'instituicao' => 'Test Institution',
                'quali' => 'A1',
                'issn' => '1234-5678',
                'tipo' => 'Internacional',
            ]);
    }

    public function test_docente_can_list_journals(): void
    {
        $docente = User::factory()->create();
        $docente->roles()->attach(2);

        Journal::create([
            'name' => 'National Journal',
            'institution' => 'Brazilian University',
            'qualis' => 'B1',
            'issn' => '9876-5432',
            'type' => 'national',
        ]);

        $response = $this->actingAs($docente)->getJson('/api/journals');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment([
                'nome' => 'National Journal',
                'instituicao' => 'Brazilian University',
                'quali' => 'B1',
                'issn' => '9876-5432',
                'tipo' => 'Nacional',
            ]);
    }

    public function test_admin_can_create_journal(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $journalData = [
            'nome' => 'New Test Journal',
            'instituicao' => 'New Institution',
            'quali' => 'A2',
            'issn' => '5555-6666',
            'tipo' => 'Internacional',
        ];

        $response = $this->actingAs($admin)->postJson('/api/journals', $journalData);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'message' => 'Revista criada com sucesso.',
            ]);

        $this->assertDatabaseHas('journals', [
            'name' => 'New Test Journal',
            'institution' => 'New Institution',
            'qualis' => 'A2',
            'issn' => '5555-6666',
            'type' => 'international',
        ]);
    }

    public function test_create_journal_validation_fails_without_required_fields(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $response = $this->actingAs($admin)->postJson('/api/journals', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nome', 'tipo']);
    }

    public function test_create_journal_fails_with_duplicate_issn(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        Journal::create([
            'name' => 'Existing Journal',
            'issn' => '1111-2222',
            'type' => 'national',
        ]);

        $response = $this->actingAs($admin)->postJson('/api/journals', [
            'nome' => 'New Journal',
            'issn' => '1111-2222',
            'tipo' => 'Nacional',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['issn']);
    }

    public function test_admin_can_update_journal(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $journal = Journal::create([
            'name' => 'Original Journal',
            'institution' => 'Original Institution',
            'qualis' => 'B2',
            'issn' => '7777-8888',
            'type' => 'national',
        ]);

        $updateData = [
            'nome' => 'Updated Journal',
            'instituicao' => 'Updated Institution',
            'quali' => 'A1',
            'issn' => '9999-0000',
            'tipo' => 'Internacional',
        ];

        $response = $this->actingAs($admin)->putJson("/api/journals/{$journal->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Revista atualizada com sucesso.',
            ]);

        $this->assertDatabaseHas('journals', [
            'id' => $journal->id,
            'name' => 'Updated Journal',
            'institution' => 'Updated Institution',
            'qualis' => 'A1',
            'issn' => '9999-0000',
            'type' => 'international',
        ]);
    }

    public function test_admin_can_delete_journal(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $journal = Journal::create([
            'name' => 'Journal to Delete',
            'type' => 'national',
        ]);

        $response = $this->actingAs($admin)->deleteJson("/api/journals/{$journal->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Revista excluída com sucesso.',
            ]);

        $this->assertSoftDeleted('journals', ['id' => $journal->id]);
    }

    public function test_admin_can_list_trashed_journals(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $journal = Journal::create([
            'name' => 'Trashed Journal',
            'type' => 'national',
        ]);
        $journal->delete();

        $response = $this->actingAs($admin)->getJson('/api/journals-trashed');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment([
                'nome' => 'Trashed Journal',
            ]);
    }

    public function test_admin_can_restore_trashed_journal(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $journal = Journal::create([
            'name' => 'Journal to Restore',
            'type' => 'national',
        ]);
        $journal->delete();

        $response = $this->actingAs($admin)->postJson("/api/journals/{$journal->id}/restore");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Revista recuperada com sucesso.',
            ]);

        $this->assertDatabaseHas('journals', [
            'id' => $journal->id,
            'deleted_at' => null,
        ]);
    }

    public function test_unauthenticated_user_cannot_create_journal(): void
    {
        $response = $this->postJson('/api/journals', [
            'nome' => 'Unauthorized Journal',
            'tipo' => 'Nacional',
        ]);

        $response->assertStatus(401);
    }

    public function test_unauthorized_user_cannot_create_journal(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(3); // discente role

        $response = $this->actingAs($user)->postJson('/api/journals', [
            'nome' => 'Unauthorized Journal',
            'tipo' => 'Nacional',
        ]);

        $response->assertStatus(403);
    }
}
