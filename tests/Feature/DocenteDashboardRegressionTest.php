<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\Event;
use App\Models\EventParticipation;
use App\Models\Journal;
use App\Models\Publication;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocenteDashboardRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_docente_dashboard_uses_academic_bond_relations_for_publications_and_events(): void
    {
        $docenteRole = Role::create(['id' => 2, 'slug' => 'docente', 'name' => 'Docente']);

        $docente = User::factory()->create();
        $docente->roles()->attach($docenteRole->id);

        $student = User::factory()->create();
        $bond = AcademicBond::factory()->create([
            'student_id' => $student->id,
            'advisor_id' => $docente->id,
            'status' => 'active',
            'level' => 'master',
        ]);

        $otherDocente = User::factory()->create();
        $otherDocente->roles()->attach($docenteRole->id);

        $otherStudent = User::factory()->create();
        $otherBond = AcademicBond::factory()->create([
            'student_id' => $otherStudent->id,
            'advisor_id' => $otherDocente->id,
            'status' => 'active',
            'level' => 'doctorate',
        ]);

        $journal = Journal::factory()->create(['qualis' => 'A1']);

        Publication::factory()->create([
            'academic_bond_id' => $bond->id,
            'journal_id' => $journal->id,
            'status' => 'P',
            'created_at' => now()->subMonths(2),
            'updated_at' => now()->subMonths(2),
        ]);

        Publication::factory()->create([
            'academic_bond_id' => $otherBond->id,
            'journal_id' => $journal->id,
            'status' => 'P',
            'created_at' => now()->subMonths(2),
            'updated_at' => now()->subMonths(2),
        ]);

        $event = Event::factory()->create();

        EventParticipation::create([
            'academic_bond_id' => $bond->id,
            'event_id' => $event->id,
            'title' => 'Trabalho orientado',
            'name' => 'Evento do orientando',
            'location' => 'Manaus',
            'year' => 2025,
            'type' => 'Congresso',
        ]);

        EventParticipation::create([
            'academic_bond_id' => $otherBond->id,
            'event_id' => $event->id,
            'title' => 'Trabalho de outro docente',
            'name' => 'Outro evento',
            'location' => 'Belem',
            'year' => 2025,
            'type' => 'Congresso',
        ]);

        $response = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/dashboard/docente-stats');

        $response->assertStatus(200)
            ->assertJsonPath('stats.publicationsLast12Months', 1)
            ->assertJsonPath('publicationsByQualis.0.count', 1)
            ->assertJsonPath('eventsMonthly.0.events', 1)
            ->assertJsonPath('topJournals.0.publications', 1);
    }
}
