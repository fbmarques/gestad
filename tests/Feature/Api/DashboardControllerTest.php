<?php

namespace Tests\Feature\Api;

use App\Models\AcademicBond;
use App\Models\Agency;
use App\Models\Course;
use App\Models\Journal;
use App\Models\Publication;
use App\Models\ResearchLine;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_stats_returns_correct_data_for_authorized_user(): void
    {
        // Create roles
        $adminRole = Role::factory()->create(['name' => 'Admin', 'id' => 1]);
        $docenteRole = Role::factory()->create(['name' => 'Docente', 'id' => 2]);
        $discenteRole = Role::factory()->create(['name' => 'Discente', 'id' => 3]);

        // Create admin user
        $admin = User::factory()->create();
        $admin->roles()->attach($adminRole);

        // Create research line and coordinator
        $researchLine = ResearchLine::factory()->create();
        $coordinator = User::factory()->create();
        $coordinator->roles()->attach($docenteRole);

        // Create students with active academic bonds
        $activeStudents = User::factory()->count(3)->create();
        foreach ($activeStudents as $student) {
            $student->roles()->attach($discenteRole);
            AcademicBond::factory()->create([
                'student_id' => $student->id,
                'advisor_id' => $coordinator->id,
                'research_line_id' => $researchLine->id,
                'status' => 'active',
                'level' => 'master',
            ]);
        }

        // Create courses
        Course::factory()->count(5)->create();

        // Create scheduled defenses
        AcademicBond::factory()->count(2)->create([
            'student_id' => $activeStudents[0]->id,
            'advisor_id' => $coordinator->id,
            'research_line_id' => $researchLine->id,
            'defense_status' => 'Scheduled',
            'defense_date' => now()->addDays(15),
        ]);

        // Create publications
        $journal = Journal::factory()->create(['qualis' => 'A1']);
        $bond = AcademicBond::where('status', 'active')->first();

        Publication::factory()->count(3)->create([
            'academic_bond_id' => $bond->id,
            'journal_id' => $journal->id,
            'status' => 'P',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => [
                    'activeStudents',
                    'coursesOffered',
                    'scheduledDefenses',
                    'defensesNext30Days',
                    'publicationsLast12Months',
                ],
                'academicDistribution',
                'publicationsByQualis',
                'scholarshipData',
                'scholarshipPercentage',
                'eventsMonthly',
                'totalEventsLast12Months',
                'topProfessors',
                'topJournals',
                'alertsData',
            ]);

        $data = $response->json();
        $this->assertEquals(3, $data['stats']['activeStudents']);
        $this->assertEquals(5, $data['stats']['coursesOffered']);
        $this->assertGreaterThanOrEqual(0, $data['stats']['scheduledDefenses']);
    }

    public function test_dashboard_stats_denies_access_to_unauthorized_user(): void
    {
        $discenteRole = Role::factory()->create(['name' => 'Discente', 'id' => 3]);
        $discente = User::factory()->create();
        $discente->roles()->attach($discenteRole);

        Sanctum::actingAs($discente);

        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(403)
            ->assertJson(['error' => 'Acesso negado.']);
    }

    public function test_dashboard_stats_requires_authentication(): void
    {
        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(401);
    }

    public function test_dashboard_stats_calculates_scholarship_percentage_correctly(): void
    {
        $adminRole = Role::factory()->create(['name' => 'Admin', 'id' => 1]);
        $admin = User::factory()->create();
        $admin->roles()->attach($adminRole);

        $researchLine = ResearchLine::factory()->create();
        $coordinator = User::factory()->create();
        $agency = Agency::factory()->create();

        // 2 students with scholarship
        for ($i = 0; $i < 2; $i++) {
            $student = User::factory()->create();
            AcademicBond::factory()->create([
                'student_id' => $student->id,
                'advisor_id' => $coordinator->id,
                'research_line_id' => $researchLine->id,
                'status' => 'active',
                'agency_id' => $agency->id,
            ]);
        }

        // 2 students without scholarship
        for ($i = 0; $i < 2; $i++) {
            $student = User::factory()->create();
            AcademicBond::factory()->create([
                'student_id' => $student->id,
                'advisor_id' => $coordinator->id,
                'research_line_id' => $researchLine->id,
                'status' => 'active',
                'agency_id' => null,
            ]);
        }

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertEquals(50, $data['scholarshipPercentage']);
    }

    public function test_dashboard_stats_groups_publications_by_qualis(): void
    {
        $adminRole = Role::factory()->create(['name' => 'Admin', 'id' => 1]);
        $admin = User::factory()->create();
        $admin->roles()->attach($adminRole);

        $researchLine = ResearchLine::factory()->create();
        $coordinator = User::factory()->create();
        $student = User::factory()->create();

        $bond = AcademicBond::factory()->create([
            'student_id' => $student->id,
            'advisor_id' => $coordinator->id,
            'research_line_id' => $researchLine->id,
            'status' => 'active',
        ]);

        $journalA1 = Journal::factory()->create(['qualis' => 'A1']);
        $journalA2 = Journal::factory()->create(['qualis' => 'A2']);

        Publication::factory()->count(2)->create([
            'academic_bond_id' => $bond->id,
            'journal_id' => $journalA1->id,
            'status' => 'P',
        ]);

        Publication::factory()->count(3)->create([
            'academic_bond_id' => $bond->id,
            'journal_id' => $journalA2->id,
            'status' => 'D',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertCount(2, $data['publicationsByQualis']);
        $this->assertEquals('A1', $data['publicationsByQualis'][0]['qualis']);
        $this->assertEquals(2, $data['publicationsByQualis'][0]['count']);
    }
}
