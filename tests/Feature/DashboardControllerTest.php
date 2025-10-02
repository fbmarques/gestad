<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    private User $docenteUser;

    private User $discenteUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminRole = Role::create(['id' => 1, 'slug' => 'admin', 'name' => 'Administrator']);
        $docenteRole = Role::create(['id' => 2, 'slug' => 'docente', 'name' => 'Docente']);
        $discenteRole = Role::create(['id' => 3, 'slug' => 'discente', 'name' => 'Discente']);

        // Create users and assign roles
        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach($adminRole->id);

        $this->docenteUser = User::factory()->create();
        $this->docenteUser->roles()->attach($docenteRole->id);

        $this->discenteUser = User::factory()->create();
        $this->discenteUser->roles()->attach($discenteRole->id);
    }

    public function test_admin_can_access_dashboard_stats(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => [
                    'activeStudents',
                    'coursesOffered',
                    'scheduledDefenses',
                    'defensesNext30Days',
                    'publicationsLast12Months',
                    'publicationsTrend',
                ],
                'researchDefinitionsPercentages',
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
    }

    public function test_docente_can_access_dashboard_stats(): void
    {
        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => [
                    'activeStudents',
                    'coursesOffered',
                    'scheduledDefenses',
                    'defensesNext30Days',
                    'publicationsLast12Months',
                    'publicationsTrend',
                ],
            ]);
    }

    public function test_discente_cannot_access_dashboard_stats(): void
    {
        $response = $this->actingAs($this->discenteUser, 'sanctum')
            ->getJson('/api/dashboard/stats');

        $response->assertStatus(403)
            ->assertJson(['error' => 'Acesso negado.']);
    }

    public function test_unauthenticated_user_cannot_access_dashboard_stats(): void
    {
        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(401);
    }

    public function test_docente_can_access_docente_dashboard_stats(): void
    {
        // Create a student academic bond with this docente as advisor
        $student = User::factory()->create();
        AcademicBond::factory()->create([
            'student_id' => $student->id,
            'advisor_id' => $this->docenteUser->id,
            'status' => 'active',
            'level' => 'master',
        ]);

        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->getJson('/api/dashboard/docente-stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => [
                    'activeStudents',
                    'coursesOffered',
                    'scheduledDefenses',
                    'defensesNext30Days',
                    'publicationsLast12Months',
                    'publicationsTrend',
                ],
                'researchDefinitionsPercentages',
                'academicDistribution',
                'publicationsByQualis',
                'scholarshipData',
                'scholarshipPercentage',
                'eventsMonthly',
                'totalEventsLast12Months',
                'topProfessors',
                'topJournals',
                'alertsData',
            ])
            ->assertJson([
                'stats' => [
                    'activeStudents' => 1, // Only students advised by this docente
                ],
            ]);
    }

    public function test_docente_sees_only_own_students_in_dashboard(): void
    {
        // Create another docente
        $anotherDocente = User::factory()->create();
        $anotherDocente->roles()->attach(2); // docente role

        // Create students for the logged-in docente
        $student1 = User::factory()->create();
        AcademicBond::factory()->create([
            'student_id' => $student1->id,
            'advisor_id' => $this->docenteUser->id,
            'status' => 'active',
            'level' => 'master',
        ]);

        $student2 = User::factory()->create();
        AcademicBond::factory()->create([
            'student_id' => $student2->id,
            'advisor_id' => $this->docenteUser->id,
            'status' => 'active',
            'level' => 'doctorate',
        ]);

        // Create a student for another docente
        $otherStudent = User::factory()->create();
        AcademicBond::factory()->create([
            'student_id' => $otherStudent->id,
            'advisor_id' => $anotherDocente->id,
            'status' => 'active',
            'level' => 'master',
        ]);

        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->getJson('/api/dashboard/docente-stats');

        $response->assertStatus(200)
            ->assertJson([
                'stats' => [
                    'activeStudents' => 2, // Only this docente's students
                ],
            ]);
    }

    public function test_admin_cannot_access_docente_dashboard_stats(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/dashboard/docente-stats');

        $response->assertStatus(403)
            ->assertJson(['error' => 'Acesso negado. Apenas docentes podem acessar este dashboard.']);
    }

    public function test_discente_cannot_access_docente_dashboard_stats(): void
    {
        $response = $this->actingAs($this->discenteUser, 'sanctum')
            ->getJson('/api/dashboard/docente-stats');

        $response->assertStatus(403)
            ->assertJson(['error' => 'Acesso negado. Apenas docentes podem acessar este dashboard.']);
    }

    public function test_unauthenticated_user_cannot_access_docente_dashboard_stats(): void
    {
        $response = $this->getJson('/api/dashboard/docente-stats');

        $response->assertStatus(401);
    }
}
