<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\Event;
use App\Models\EventParticipation;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentEventParticipationsTest extends TestCase
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

    public function test_discente_can_get_event_participations_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $event = Event::factory()->create([
            'nome' => 'Test Event',
            'alias' => 'TE',
        ]);

        $participation = EventParticipation::create([
            'academic_bond_id' => $academicBond->id,
            'event_id' => $event->id,
            'title' => 'Test Participation',
            'name' => 'Test Event Name',
            'location' => 'Test Location',
            'year' => 2024,
            'type' => 'Conferência',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/event-participations');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'event_id',
                    'event_name',
                    'event_alias',
                    'title',
                    'name',
                    'location',
                    'year',
                    'type',
                ],
            ])
            ->assertJsonFragment([
                'title' => 'Test Participation',
                'name' => 'Test Event Name',
                'location' => 'Test Location',
                'year' => 2024,
                'type' => 'Conferência',
            ]);
    }

    public function test_unauthenticated_user_cannot_access_event_participations(): void
    {
        $response = $this->getJson('/api/student/event-participations');

        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_non_discente_cannot_access_event_participations(): void
    {
        $docente = User::factory()->create();
        $docente->roles()->attach(2);

        $response = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/student/event-participations');

        $response->assertStatus(403)
            ->assertJson(['error' => 'Acesso negado. Apenas discentes podem acessar as participações em eventos.']);
    }

    public function test_discente_can_add_event_participation_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $event = Event::factory()->create();

        $participationData = [
            'event_id' => $event->id,
            'title' => 'New Participation Title',
            'name' => 'New Event Name',
            'location' => 'New Location',
            'year' => 2024,
            'type' => 'Simpósio',
        ];

        $response = $this->actingAs($discente, 'sanctum')
            ->postJson('/api/student/event-participations', $participationData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'participation' => [
                    'id',
                    'event_id',
                    'event_name',
                    'event_alias',
                    'title',
                    'name',
                    'location',
                    'year',
                    'type',
                ],
            ])
            ->assertJsonFragment([
                'message' => 'Participação em evento adicionada com sucesso.',
                'title' => 'New Participation Title',
                'name' => 'New Event Name',
                'location' => 'New Location',
                'year' => 2024,
                'type' => 'Simpósio',
            ]);

        $this->assertDatabaseHas('event_participations', [
            'academic_bond_id' => $academicBond->id,
            'event_id' => $event->id,
            'title' => 'New Participation Title',
            'name' => 'New Event Name',
            'location' => 'New Location',
            'year' => 2024,
            'type' => 'Simpósio',
        ]);
    }

    public function test_add_event_participation_with_invalid_data_fails(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $invalidData = [
            'event_id' => 'invalid',
            'title' => '',
            'name' => '',
            'location' => '',
            'year' => 'invalid',
            'type' => 'invalid_type',
        ];

        $response = $this->actingAs($discente, 'sanctum')
            ->postJson('/api/student/event-participations', $invalidData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['event_id', 'title', 'name', 'location', 'year', 'type']);
    }

    public function test_discente_can_remove_event_participation_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $academicBond = AcademicBond::factory()->create([
            'student_id' => $discente->id,
            'status' => 'active',
        ]);

        $event = Event::factory()->create();

        $participation = EventParticipation::create([
            'academic_bond_id' => $academicBond->id,
            'event_id' => $event->id,
            'title' => 'Test Participation',
            'name' => 'Test Event Name',
            'location' => 'Test Location',
            'year' => 2024,
            'type' => 'Workshop',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->deleteJson("/api/student/event-participations/{$participation->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Participação em evento removida com sucesso.']);

        $this->assertDatabaseMissing('event_participations', [
            'id' => $participation->id,
        ]);
    }

    public function test_discente_cannot_remove_other_student_participation(): void
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

        $event = Event::factory()->create();

        $participation = EventParticipation::create([
            'academic_bond_id' => $academicBond2->id,
            'event_id' => $event->id,
            'title' => 'Other Student Participation',
            'name' => 'Test Event Name',
            'location' => 'Test Location',
            'year' => 2024,
            'type' => 'Congresso',
        ]);

        $response = $this->actingAs($discente1, 'sanctum')
            ->deleteJson("/api/student/event-participations/{$participation->id}");

        $response->assertStatus(404)
            ->assertJson(['error' => 'Participação em evento não encontrada ou não pertence a este discente.']);

        $this->assertDatabaseHas('event_participations', [
            'id' => $participation->id,
        ]);
    }

    public function test_discente_can_get_available_events(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $event1 = Event::factory()->create([
            'nome' => 'First Event',
            'alias' => 'FE',
            'tipo' => 'Conferência',
            'natureza' => 'Nacional',
        ]);

        $event2 = Event::factory()->create([
            'nome' => 'Second Event',
            'alias' => 'SE',
            'tipo' => 'Simpósio',
            'natureza' => 'Internacional',
        ]);

        $response = $this->actingAs($discente, 'sanctum')
            ->getJson('/api/student/available-events');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'nome',
                    'alias',
                    'tipo',
                    'natureza',
                ],
            ])
            ->assertJsonFragment([
                'nome' => 'First Event',
                'alias' => 'FE',
                'tipo' => 'Conferência',
                'natureza' => 'Nacional',
            ])
            ->assertJsonFragment([
                'nome' => 'Second Event',
                'alias' => 'SE',
                'tipo' => 'Simpósio',
                'natureza' => 'Internacional',
            ]);
    }
}
