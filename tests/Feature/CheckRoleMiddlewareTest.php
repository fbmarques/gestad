<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckRoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Criar roles
        Role::create(['id' => 1, 'name' => 'Administrador', 'slug' => 'admin', 'description' => 'Acesso total']);
        Role::create(['id' => 2, 'name' => 'Docente', 'slug' => 'docente', 'description' => 'Professor']);
        Role::create(['id' => 3, 'name' => 'Discente', 'slug' => 'discente', 'description' => 'Estudante']);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->get('/administrativo');
        $response->assertRedirect('/login');

        $response = $this->get('/docente');
        $response->assertRedirect('/login');

        $response = $this->get('/discente');
        $response->assertRedirect('/login');
    }

    public function test_admin_can_access_admin_route(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(1);

        $response = $this->actingAs($user)->get('/administrativo');
        $response->assertStatus(200);
    }

    public function test_admin_cannot_access_other_role_routes(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(1);

        $response = $this->actingAs($user)->get('/docente');
        $response->assertStatus(403);
        $response->assertJson(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.']);

        $response = $this->actingAs($user)->get('/discente');
        $response->assertStatus(403);
        $response->assertJson(['error' => 'Acesso negado. Você não possui permissão para acessar esta área.']);
    }

    public function test_docente_can_access_docente_route(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(2);

        $response = $this->actingAs($user)->get('/docente');
        $response->assertStatus(200);
    }

    public function test_docente_cannot_access_other_role_routes(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(2);

        $response = $this->actingAs($user)->get('/administrativo');
        $response->assertStatus(403);

        $response = $this->actingAs($user)->get('/discente');
        $response->assertStatus(403);
    }

    public function test_discente_can_access_discente_route(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(3);

        $response = $this->actingAs($user)->get('/discente');
        $response->assertStatus(200);
    }

    public function test_discente_cannot_access_other_role_routes(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(3);

        $response = $this->actingAs($user)->get('/administrativo');
        $response->assertStatus(403);

        $response = $this->actingAs($user)->get('/docente');
        $response->assertStatus(403);
    }

    public function test_user_without_role_cannot_access_any_protected_route(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/administrativo');
        $response->assertStatus(403);

        $response = $this->actingAs($user)->get('/docente');
        $response->assertStatus(403);

        $response = $this->actingAs($user)->get('/discente');
        $response->assertStatus(403);
    }
}
