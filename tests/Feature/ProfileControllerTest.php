<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_get_their_roles(): void
    {
        $user = User::factory()->create();

        $adminRole = Role::factory()->create(['slug' => 'admin', 'name' => 'Administrator']);
        $docenteRole = Role::factory()->create(['slug' => 'docente', 'name' => 'Docente']);

        $user->roles()->attach([$adminRole->id, $docenteRole->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/user/roles');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'roles' => [
                    ['slug' => 'admin', 'name' => 'Administrator'],
                    ['slug' => 'docente', 'name' => 'Docente'],
                ]
            ]);
    }

    public function test_unauthenticated_user_cannot_get_roles(): void
    {
        $response = $this->getJson('/api/user/roles');

        $response->assertStatus(401);
    }

    public function test_user_with_no_roles_gets_empty_array(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/user/roles');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'roles' => []
            ]);
    }
}
