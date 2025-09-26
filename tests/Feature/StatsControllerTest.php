<?php

namespace Tests\Feature;

use App\Models\Agency;
use App\Models\Course;
use App\Models\Event;
use App\Models\Journal;
use App\Models\ResearchLine;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StatsControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_stats_counts_returns_correct_counts_for_authorized_user(): void
    {
        // Create roles
        $adminRole = Role::factory()->create(['name' => 'Admin', 'id' => 1]);
        $docenteRole = Role::factory()->create(['name' => 'Docente', 'id' => 2]);
        $discenteRole = Role::factory()->create(['name' => 'Discente', 'id' => 3]);

        // Create test data
        $admin = User::factory()->create();
        $admin->roles()->attach($adminRole);

        $docentes = User::factory()->count(3)->create();
        foreach ($docentes as $docente) {
            $docente->roles()->attach($docenteRole);
        }

        $discentes = User::factory()->count(5)->create();
        foreach ($discentes as $discente) {
            $discente->roles()->attach($discenteRole);
        }

        ResearchLine::factory()->count(2)->create();
        Course::factory()->count(4)->create();
        Agency::factory()->count(1)->create();
        Journal::factory()->count(3)->create();
        Event::factory()->count(2)->create();

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/stats/counts');

        $response->assertStatus(200)
            ->assertJson([
                'discentes' => 5,
                'docentes' => 3,
                'linhaspesquisa' => 2,
                'disciplinas' => 4,
                'agencias' => 1,
                'revistas' => 3,
                'eventos' => 2,
                'producoes' => 0,
            ]);
    }

    public function test_stats_counts_denies_access_to_unauthorized_user(): void
    {
        $discenteRole = Role::factory()->create(['name' => 'Discente', 'id' => 3]);
        $discente = User::factory()->create();
        $discente->roles()->attach($discenteRole);

        Sanctum::actingAs($discente);

        $response = $this->getJson('/api/stats/counts');

        $response->assertStatus(403)
            ->assertJson(['error' => 'Acesso negado.']);
    }

    public function test_stats_counts_requires_authentication(): void
    {
        $response = $this->getJson('/api/stats/counts');

        $response->assertStatus(401);
    }
}
