<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\Course;
use App\Models\Event;
use App\Models\EventParticipation;
use App\Models\Journal;
use App\Models\Publication;
use App\Models\Role;
use App\Models\StudentCourse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocenteReportsTest extends TestCase
{
    use RefreshDatabase;

    public function test_docente_can_get_orientandos_report_only_for_their_advisees(): void
    {
        $docenteRole = Role::create(['id' => 2, 'slug' => 'docente', 'name' => 'Docente']);

        $docente = User::factory()->create();
        $docente->roles()->attach($docenteRole->id);

        $orientando = User::factory()->create(['email' => 'orientando@example.com']);
        AcademicBond::factory()->create([
            'student_id' => $orientando->id,
            'advisor_id' => $docente->id,
            'status' => 'active',
            'level' => 'master',
            'start_date' => '2025-03-10',
            'end_date' => '2027-03-10',
        ]);

        $otherDocente = User::factory()->create();
        $otherDocente->roles()->attach($docenteRole->id);

        $otherStudent = User::factory()->create(['email' => 'outro@example.com']);
        AcademicBond::factory()->create([
            'student_id' => $otherStudent->id,
            'advisor_id' => $otherDocente->id,
            'status' => 'active',
            'level' => 'doctorate',
        ]);

        $response = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/reports/docente/orientandos?active_role=docente');

        $response->assertStatus(200)
            ->assertJsonPath('title', 'Acompanhamento de Orientandos')
            ->assertJsonCount(1, 'rows')
            ->assertJsonPath('rows.0.student_name', $orientando->name)
            ->assertJsonPath('rows.0.email', 'orientando@example.com')
            ->assertJsonPath('rows.0.modality', 'Mestrado')
            ->assertJsonPath('rows.0.start_date', '10/03/2025')
            ->assertJsonPath('rows.0.end_date', '10/03/2027');
    }

    public function test_admin_reports_include_advisor_as_first_column_and_order_by_advisor_then_student(): void
    {
        $adminRole = Role::create(['id' => 1, 'slug' => 'admin', 'name' => 'Administrador']);
        $docenteRole = Role::create(['id' => 2, 'slug' => 'docente', 'name' => 'Docente']);

        $admin = User::factory()->create();
        $admin->roles()->attach($adminRole->id);

        $aliceAdvisor = User::factory()->create(['name' => 'Alice Orientadora']);
        $aliceAdvisor->roles()->attach($docenteRole->id);

        $brunoAdvisor = User::factory()->create(['name' => 'Bruno Orientador']);
        $brunoAdvisor->roles()->attach($docenteRole->id);

        $zoeStudent = User::factory()->create(['name' => 'Zoe Discente']);
        $carlosStudent = User::factory()->create(['name' => 'Carlos Discente']);
        $anaStudent = User::factory()->create(['name' => 'Ana Discente']);

        AcademicBond::factory()->create([
            'student_id' => $zoeStudent->id,
            'advisor_id' => $aliceAdvisor->id,
            'status' => 'active',
            'level' => 'master',
        ]);

        AcademicBond::factory()->create([
            'student_id' => $anaStudent->id,
            'advisor_id' => $brunoAdvisor->id,
            'status' => 'active',
            'level' => 'master',
        ]);

        AcademicBond::factory()->create([
            'student_id' => $carlosStudent->id,
            'advisor_id' => $aliceAdvisor->id,
            'status' => 'active',
            'level' => 'doctorate',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/reports/docente/orientandos?active_role=admin');

        $response->assertStatus(200)
            ->assertJsonPath('columns.0', 'Orientador')
            ->assertJsonPath('columns.1', 'Orientando')
            ->assertJsonPath('rows.0.advisor_name', 'Alice Orientadora')
            ->assertJsonPath('rows.0.student_name', 'Carlos Discente')
            ->assertJsonPath('rows.1.advisor_name', 'Alice Orientadora')
            ->assertJsonPath('rows.1.student_name', 'Zoe Discente')
            ->assertJsonPath('rows.2.advisor_name', 'Bruno Orientador')
            ->assertJsonPath('rows.2.student_name', 'Ana Discente');

        foreach (['producoes', 'prazos', 'definicoes', 'acessos', 'creditos'] as $reportType) {
            $this->actingAs($admin, 'sanctum')
                ->getJson("/api/reports/docente/{$reportType}?active_role=admin")
                ->assertStatus(200)
                ->assertJsonPath('columns.0', 'Orientador')
                ->assertJsonPath('rows.0.advisor_name', 'Alice Orientadora');
        }

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/reports/docente/creditos?active_role=admin')
            ->assertStatus(200)
            ->assertJsonPath('columns.1', 'Orientando')
            ->assertJsonPath('columns.2', 'Modalidade')
            ->assertJsonPath('columns.3', 'Créditos')
            ->assertJsonPath('columns.4', 'Créditos Cursados')
            ->assertJsonPath('rows.0.modality', 'Doutorado')
            ->assertJsonPath('rows.0.required_credits', 22)
            ->assertJsonPath('rows.0.completed_credits', 0);
    }

    public function test_docente_can_get_prazos_and_definicoes_reports_with_computed_flags(): void
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
            'start_date' => '2025-01-15',
            'end_date' => '2027-01-15',
            'problem_defined' => true,
            'question_defined' => false,
            'objectives_defined' => true,
            'methodology_defined' => false,
        ]);

        $courseA = Course::factory()->create(['credits' => 10]);
        $courseB = Course::factory()->create(['credits' => 8]);

        StudentCourse::create([
            'academic_bond_id' => $bond->id,
            'course_id' => $courseA->id,
            'docente_id' => $docente->id,
        ]);

        StudentCourse::create([
            'academic_bond_id' => $bond->id,
            'course_id' => $courseB->id,
            'docente_id' => $docente->id,
        ]);

        $event = Event::factory()->create();
        EventParticipation::create([
            'academic_bond_id' => $bond->id,
            'event_id' => $event->id,
            'title' => 'Trabalho apresentado',
            'name' => 'Congresso Nacional',
            'location' => 'Belo Horizonte',
            'year' => 2025,
            'type' => 'Congresso',
        ]);

        $journal = Journal::factory()->create();
        Publication::factory()->create([
            'academic_bond_id' => $bond->id,
            'journal_id' => $journal->id,
            'status' => 'S',
            'approval_date' => null,
            'publication_date' => null,
        ]);

        Publication::factory()->create([
            'academic_bond_id' => $bond->id,
            'journal_id' => $journal->id,
            'status' => 'P',
            'approval_date' => '2026-02-10',
            'publication_date' => '2026-03-10',
        ]);

        $prazosResponse = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/reports/docente/prazos?active_role=docente');

        $prazosResponse->assertStatus(200)
            ->assertJsonPath('columns.1', 'Modalidade')
            ->assertJsonPath('rows.0.student_name', $student->name)
            ->assertJsonPath('rows.0.modality', 'Mestrado')
            ->assertJsonPath('rows.0.start_date', '15/01/2025')
            ->assertJsonPath('rows.0.end_date', '15/01/2027')
            ->assertJsonPath('rows.0.remaining_days', 268)
            ->assertJsonPath('rows.0.credits', 'Ok')
            ->assertJsonPath('rows.0.events', 'Ok')
            ->assertJsonPath('rows.0.articles', '1-S, 1-P');

        $definicoesResponse = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/reports/docente/definicoes?active_role=docente');

        $definicoesResponse->assertStatus(200)
            ->assertJsonPath('columns.1', 'Modalidade')
            ->assertJsonPath('rows.0.student_name', $student->name)
            ->assertJsonPath('rows.0.modality', 'Mestrado')
            ->assertJsonPath('rows.0.problem', 'Ok')
            ->assertJsonPath('rows.0.question', '[-]')
            ->assertJsonPath('rows.0.objectives', 'Ok')
            ->assertJsonPath('rows.0.methodology', '[-]');

        $creditosResponse = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/reports/docente/creditos?active_role=docente');

        $creditosResponse->assertStatus(200)
            ->assertJsonPath('title', 'Créditos já cursados')
            ->assertJsonPath('columns.0', 'Orientando')
            ->assertJsonPath('columns.1', 'Modalidade')
            ->assertJsonPath('columns.2', 'Créditos')
            ->assertJsonPath('columns.3', 'Créditos Cursados')
            ->assertJsonPath('rows.0.student_name', $student->name)
            ->assertJsonPath('rows.0.modality', 'Mestrado')
            ->assertJsonPath('rows.0.required_credits', 18)
            ->assertJsonPath('rows.0.completed_credits', 18);
    }

    public function test_docente_can_get_producoes_report_grouped_by_publication_stage(): void
    {
        $docenteRole = Role::create(['id' => 2, 'slug' => 'docente', 'name' => 'Docente']);

        $docente = User::factory()->create();
        $docente->roles()->attach($docenteRole->id);

        $student = User::factory()->create();
        $bond = AcademicBond::factory()->create([
            'student_id' => $student->id,
            'advisor_id' => $docente->id,
            'status' => 'active',
            'level' => 'doctorate',
        ]);

        $journal = Journal::factory()->create();

        Publication::factory()->count(2)->create([
            'academic_bond_id' => $bond->id,
            'journal_id' => $journal->id,
            'status' => 'S',
            'approval_date' => null,
            'publication_date' => null,
        ]);

        Publication::factory()->count(2)->create([
            'academic_bond_id' => $bond->id,
            'journal_id' => $journal->id,
            'status' => 'A',
            'approval_date' => '2026-03-10',
            'publication_date' => null,
        ]);

        Publication::factory()->create([
            'academic_bond_id' => $bond->id,
            'journal_id' => $journal->id,
            'status' => 'P',
            'approval_date' => '2026-02-10',
            'publication_date' => '2026-04-10',
        ]);

        $response = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/reports/docente/producoes?active_role=docente');

        $response->assertStatus(200)
            ->assertJsonPath('title', 'Produção Acadêmica')
            ->assertJsonPath('rows.0.student_name', $student->name)
            ->assertJsonPath('rows.0.modality', 'Doutorado')
            ->assertJsonPath('rows.0.submission_count', 2)
            ->assertJsonPath('rows.0.approval_count', 2)
            ->assertJsonPath('rows.0.publication_count', 1);
    }

    public function test_docente_producoes_report_counts_publications_from_other_bonds_of_the_same_student(): void
    {
        $docenteRole = Role::create(['id' => 2, 'slug' => 'docente', 'name' => 'Docente']);

        $docente = User::factory()->create();
        $docente->roles()->attach($docenteRole->id);

        $student = User::factory()->create();

        $activeBond = AcademicBond::factory()->create([
            'student_id' => $student->id,
            'advisor_id' => $docente->id,
            'status' => 'active',
            'level' => 'doctorate',
        ]);

        $oldBond = AcademicBond::factory()->create([
            'student_id' => $student->id,
            'advisor_id' => $docente->id,
            'status' => 'completed',
            'level' => 'master',
        ]);

        $journal = Journal::factory()->create();

        Publication::factory()->create([
            'academic_bond_id' => $oldBond->id,
            'journal_id' => $journal->id,
            'status' => 'S',
            'approval_date' => null,
            'publication_date' => null,
        ]);

        Publication::factory()->create([
            'academic_bond_id' => $oldBond->id,
            'journal_id' => $journal->id,
            'status' => 'A',
            'approval_date' => '2026-03-10',
            'publication_date' => null,
        ]);

        $response = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/reports/docente/producoes?active_role=docente');

        $response->assertStatus(200)
            ->assertJsonPath('rows.0.student_name', $student->name)
            ->assertJsonPath('rows.0.modality', 'Doutorado')
            ->assertJsonPath('rows.0.submission_count', 1)
            ->assertJsonPath('rows.0.approval_count', 1)
            ->assertJsonPath('rows.0.publication_count', 0);
    }

    public function test_docente_can_get_last_access_report_with_fallback_for_students_without_access(): void
    {
        $docenteRole = Role::create(['id' => 2, 'slug' => 'docente', 'name' => 'Docente']);

        $docente = User::factory()->create();
        $docente->roles()->attach($docenteRole->id);

        $studentWithAccess = User::factory()->create([
            'last_access_at' => '2026-04-20 14:30:45',
        ]);

        $studentWithoutAccess = User::factory()->create([
            'last_access_at' => null,
        ]);

        AcademicBond::factory()->create([
            'student_id' => $studentWithAccess->id,
            'advisor_id' => $docente->id,
            'status' => 'active',
            'level' => 'doctorate',
        ]);

        AcademicBond::factory()->create([
            'student_id' => $studentWithoutAccess->id,
            'advisor_id' => $docente->id,
            'status' => 'active',
            'level' => 'master',
        ]);

        $response = $this->actingAs($docente, 'sanctum')
            ->getJson('/api/reports/docente/acessos?active_role=docente');

        $response->assertStatus(200)
            ->assertJsonPath('title', 'Último Acesso ao Sistema')
            ->assertJsonCount(2, 'rows')
            ->assertJsonPath('rows.0.modality', 'Doutorado')
            ->assertJsonPath('rows.0.last_access_at', '20/04/2026 14:30:45')
            ->assertJsonPath('rows.1.modality', 'Mestrado')
            ->assertJsonPath('rows.1.last_access_at', 'Sem acesso.');
    }
}
