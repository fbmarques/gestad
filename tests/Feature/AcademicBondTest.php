<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AcademicBondTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_get_academic_levels(): void
    {
        $user = User::factory()->create();

        // Create academic bonds for the user
        AcademicBond::factory()->create([
            'student_id' => $user->id,
            'level' => 'master',
            'status' => 'active',
        ]);

        AcademicBond::factory()->create([
            'student_id' => $user->id,
            'level' => 'doctorate',
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);

        $response = $this->get('/api/user/academic-levels');

        $response->assertStatus(200)
            ->assertJsonStructure(['levels'])
            ->assertJson([
                'levels' => ['master', 'doctorate'],
            ]);
    }

    public function test_user_gets_empty_levels_when_no_active_bonds(): void
    {
        $user = User::factory()->create();

        // Create inactive academic bond
        AcademicBond::factory()->create([
            'student_id' => $user->id,
            'level' => 'master',
            'status' => 'inactive',
        ]);

        Sanctum::actingAs($user);

        $response = $this->get('/api/user/academic-levels');

        $response->assertStatus(200)
            ->assertJson(['levels' => []]);
    }

    public function test_unauthenticated_user_cannot_access_academic_levels(): void
    {
        $response = $this->getJson('/api/user/academic-levels');

        $response->assertStatus(401);
    }
}
