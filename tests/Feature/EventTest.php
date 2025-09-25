<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $adminUser;

    private User $unauthorizedUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminRole = Role::factory()->create(['id' => 1, 'name' => 'Administrador']);
        $unauthorizedRole = Role::factory()->create(['id' => 3, 'name' => 'Discente']);

        // Create users
        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach($adminRole->id);

        $this->unauthorizedUser = User::factory()->create();
        $this->unauthorizedUser->roles()->attach($unauthorizedRole->id);
    }

    public function test_unauthenticated_user_cannot_access_events(): void
    {
        $response = $this->getJson('/api/events');

        $response->assertStatus(401);
    }

    public function test_unauthorized_user_cannot_access_events(): void
    {
        Sanctum::actingAs($this->unauthorizedUser);

        $response = $this->getJson('/api/events');

        $response->assertStatus(403);
        $response->assertJson(['error' => 'Acesso negado.']);
    }

    public function test_authorized_user_can_list_events(): void
    {
        Sanctum::actingAs($this->adminUser);

        $events = Event::factory()->count(3)->create();

        $response = $this->getJson('/api/events');

        $response->assertStatus(200);
        $response->assertJsonCount(3);
        $response->assertJsonStructure([
            '*' => ['id', 'nome', 'alias', 'tipo', 'natureza', 'created_at', 'updated_at'],
        ]);
    }

    public function test_authorized_user_can_create_event(): void
    {
        Sanctum::actingAs($this->adminUser);

        $eventData = [
            'nome' => 'International Conference on Software Testing',
            'alias' => 'ICST',
            'tipo' => 'Conferência',
            'natureza' => 'Internacional',
        ];

        $response = $this->postJson('/api/events', $eventData);

        $response->assertStatus(201);
        $response->assertJsonStructure(['id', 'nome', 'alias', 'tipo', 'natureza']);

        $this->assertDatabaseHas('events', [
            'nome' => 'International Conference on Software Testing',
            'alias' => 'ICST',
            'tipo' => 'Conferência',
            'natureza' => 'Internacional',
        ]);
    }

    public function test_create_event_validation_fails_with_empty_data(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/events', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['nome', 'alias', 'tipo', 'natureza']);
    }

    public function test_create_event_validation_fails_with_invalid_tipo(): void
    {
        Sanctum::actingAs($this->adminUser);

        $eventData = [
            'nome' => 'Test Event',
            'alias' => 'TE',
            'tipo' => 'Invalid Type',
            'natureza' => 'Nacional',
        ];

        $response = $this->postJson('/api/events', $eventData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['tipo']);
    }

    public function test_create_event_validation_fails_with_duplicate_alias(): void
    {
        Sanctum::actingAs($this->adminUser);

        Event::factory()->create(['alias' => 'DUPLICATE']);

        $eventData = [
            'nome' => 'New Event',
            'alias' => 'DUPLICATE',
            'tipo' => 'Conferência',
            'natureza' => 'Nacional',
        ];

        $response = $this->postJson('/api/events', $eventData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['alias']);
    }

    public function test_authorized_user_can_show_event(): void
    {
        Sanctum::actingAs($this->adminUser);

        $event = Event::factory()->create();

        $response = $this->getJson("/api/events/{$event->id}");

        $response->assertStatus(200);
        $response->assertJsonStructure(['id', 'nome', 'alias', 'tipo', 'natureza']);
    }

    public function test_authorized_user_can_update_event(): void
    {
        Sanctum::actingAs($this->adminUser);

        $event = Event::factory()->create([
            'nome' => 'Old Event Name',
            'alias' => 'OLD',
        ]);

        $updateData = [
            'nome' => 'Updated Event Name',
            'alias' => 'UPDATED',
            'tipo' => 'Workshop',
            'natureza' => 'Nacional',
        ];

        $response = $this->putJson("/api/events/{$event->id}", $updateData);

        $response->assertStatus(200);
        $response->assertJsonStructure(['id', 'nome', 'alias', 'tipo', 'natureza']);

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'nome' => 'Updated Event Name',
            'alias' => 'UPDATED',
            'tipo' => 'Workshop',
            'natureza' => 'Nacional',
        ]);
    }

    public function test_authorized_user_can_delete_event(): void
    {
        Sanctum::actingAs($this->adminUser);

        $event = Event::factory()->create();

        $response = $this->deleteJson("/api/events/{$event->id}");

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Evento excluído com sucesso.']);

        $this->assertSoftDeleted('events', ['id' => $event->id]);
    }

    public function test_unauthorized_user_cannot_delete_event(): void
    {
        Sanctum::actingAs($this->unauthorizedUser);

        $event = Event::factory()->create();

        $response = $this->deleteJson("/api/events/{$event->id}");

        $response->assertStatus(403);
        $response->assertJson(['error' => 'Acesso negado.']);
    }

    public function test_authorized_user_can_list_trashed_events(): void
    {
        Sanctum::actingAs($this->adminUser);

        $activeEvent = Event::factory()->create();
        $trashedEvent = Event::factory()->create();
        $trashedEvent->delete();

        $response = $this->getJson('/api/events-trashed');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonStructure([
            '*' => ['id', 'nome', 'alias', 'tipo', 'natureza', 'dataExclusao'],
        ]);
    }

    public function test_authorized_user_can_restore_event(): void
    {
        Sanctum::actingAs($this->adminUser);

        $event = Event::factory()->create();
        $event->delete();

        $response = $this->postJson("/api/events/{$event->id}/restore");

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Evento restaurado com sucesso.']);

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'deleted_at' => null,
        ]);
    }

    public function test_unauthorized_user_cannot_restore_event(): void
    {
        Sanctum::actingAs($this->unauthorizedUser);

        $event = Event::factory()->create();
        $event->delete();

        $response = $this->postJson("/api/events/{$event->id}/restore");

        $response->assertStatus(403);
        $response->assertJson(['error' => 'Acesso negado.']);
    }
}
