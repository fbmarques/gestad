<?php

namespace Tests\Feature;

use App\Models\Agency;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgencyControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['id' => 1, 'name' => 'Administrador', 'slug' => 'admin', 'description' => 'Acesso total']);
        Role::create(['id' => 2, 'name' => 'Docente', 'slug' => 'docente', 'description' => 'Professor']);
        Role::create(['id' => 3, 'name' => 'Discente', 'slug' => 'discente', 'description' => 'Estudante']);
    }

    public function test_unauthenticated_user_cannot_access_agencies(): void
    {
        $response = $this->getJson('/api/agencies');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_cannot_access_agencies(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(3); // discente role

        $response = $this->actingAs($user)->getJson('/api/agencies');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_agencies(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        Agency::create([
            'name' => 'Conselho Nacional de Desenvolvimento Científico e Tecnológico',
            'alias' => 'CNPq',
            'description' => 'Órgão ligado ao Ministério da Ciência',
        ]);

        $response = $this->actingAs($admin)->getJson('/api/agencies');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'apelido', 'nome', 'description', 'created_at', 'updated_at'],
            ])
            ->assertJsonFragment(['apelido' => 'CNPq']);
    }

    public function test_docente_can_list_agencies(): void
    {
        $docente = User::factory()->create();
        $docente->roles()->attach(2);

        Agency::create([
            'name' => 'CAPES',
            'alias' => 'CAPES',
            'description' => 'Fundação ligada ao Ministério da Educação',
        ]);

        $response = $this->actingAs($docente)->getJson('/api/agencies');

        $response->assertStatus(200)
            ->assertJsonFragment(['apelido' => 'CAPES']);
    }

    public function test_admin_can_create_agency(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $agencyData = [
            'name' => 'Fundação de Amparo à Pesquisa do Estado de São Paulo',
            'alias' => 'FAPESP',
            'description' => 'Agência de fomento paulista',
        ];

        $response = $this->actingAs($admin)->postJson('/api/agencies', $agencyData);

        $response->assertStatus(201)
            ->assertJsonFragment(['apelido' => 'FAPESP']);

        $this->assertDatabaseHas('agencies', $agencyData);
    }

    public function test_docente_can_create_agency(): void
    {
        $docente = User::factory()->create();
        $docente->roles()->attach(2);

        $agencyData = [
            'name' => 'Fundação Carlos Chagas Filho',
            'alias' => 'FAPERJ',
            'description' => 'Agência de fomento do RJ',
        ];

        $response = $this->actingAs($docente)->postJson('/api/agencies', $agencyData);

        $response->assertStatus(201)
            ->assertJsonFragment(['apelido' => 'FAPERJ']);
    }

    public function test_discente_cannot_create_agency(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $agencyData = [
            'name' => 'Test Agency',
            'alias' => 'TEST',
        ];

        $response = $this->actingAs($discente)->postJson('/api/agencies', $agencyData);

        $response->assertStatus(403);
    }

    public function test_create_agency_validation_fails_for_missing_required_fields(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $response = $this->actingAs($admin)->postJson('/api/agencies', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'alias']);
    }

    public function test_create_agency_validation_fails_for_duplicate_name(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        Agency::create([
            'name' => 'Duplicate Agency',
            'alias' => 'DUP1',
        ]);

        $response = $this->actingAs($admin)->postJson('/api/agencies', [
            'name' => 'Duplicate Agency',
            'alias' => 'DUP2',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_create_agency_validation_fails_for_duplicate_alias(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        Agency::create([
            'name' => 'Agency One',
            'alias' => 'DUP',
        ]);

        $response = $this->actingAs($admin)->postJson('/api/agencies', [
            'name' => 'Agency Two',
            'alias' => 'DUP',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['alias']);
    }

    public function test_admin_can_show_agency(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $agency = Agency::create([
            'name' => 'Test Agency',
            'alias' => 'TEST',
            'description' => 'Test Description',
        ]);

        $response = $this->actingAs($admin)->getJson("/api/agencies/{$agency->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $agency->id,
                'apelido' => 'TEST',
                'nome' => 'Test Agency',
                'description' => 'Test Description',
            ]);
    }

    public function test_admin_can_update_agency(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $agency = Agency::create([
            'name' => 'Original Name',
            'alias' => 'ORIG',
        ]);

        $updateData = [
            'name' => 'Updated Name',
            'alias' => 'UPD',
            'description' => 'Updated description',
        ];

        $response = $this->actingAs($admin)->putJson("/api/agencies/{$agency->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment(['apelido' => 'UPD']);

        $this->assertDatabaseHas('agencies', $updateData);
    }

    public function test_update_agency_validation_ignores_own_record_for_unique_fields(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $agency = Agency::create([
            'name' => 'Test Agency',
            'alias' => 'TEST',
        ]);

        $response = $this->actingAs($admin)->putJson("/api/agencies/{$agency->id}", [
            'name' => 'Test Agency',
            'alias' => 'TEST',
            'description' => 'Updated description',
        ]);

        $response->assertStatus(200);
    }

    public function test_admin_can_delete_agency(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $agency = Agency::create([
            'name' => 'To Delete',
            'alias' => 'DEL',
        ]);

        $response = $this->actingAs($admin)->deleteJson("/api/agencies/{$agency->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('agencies', ['id' => $agency->id]);
    }

    public function test_admin_can_list_trashed_agencies(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $agency = Agency::create([
            'name' => 'Deleted Agency',
            'alias' => 'DEL',
        ]);

        $agency->delete();

        $response = $this->actingAs($admin)->getJson('/api/agencies-trashed');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'apelido', 'nome', 'description', 'dataExclusao'],
            ])
            ->assertJsonFragment(['apelido' => 'DEL']);
    }

    public function test_admin_can_restore_trashed_agency(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);

        $agency = Agency::create([
            'name' => 'To Restore',
            'alias' => 'RES',
        ]);

        $agency->delete();

        $response = $this->actingAs($admin)->postJson("/api/agencies/{$agency->id}/restore");

        $response->assertStatus(200);

        $this->assertDatabaseHas('agencies', [
            'id' => $agency->id,
            'deleted_at' => null,
        ]);
    }

    public function test_discente_cannot_perform_any_agency_operations(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $agency = Agency::factory()->create();

        // Test all operations
        $this->actingAs($discente)->getJson('/api/agencies')->assertStatus(403);
        $this->actingAs($discente)->postJson('/api/agencies', ['name' => 'Test', 'alias' => 'TST'])->assertStatus(403);
        $this->actingAs($discente)->getJson("/api/agencies/{$agency->id}")->assertStatus(403);
        $this->actingAs($discente)->putJson("/api/agencies/{$agency->id}", ['name' => 'Updated'])->assertStatus(403);
        $this->actingAs($discente)->deleteJson("/api/agencies/{$agency->id}")->assertStatus(403);
        $this->actingAs($discente)->getJson('/api/agencies-trashed')->assertStatus(403);
        $this->actingAs($discente)->postJson("/api/agencies/{$agency->id}/restore")->assertStatus(403);
    }
}
