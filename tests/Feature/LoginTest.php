<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminRole = Role::create([
            'name' => 'Administrador',
            'slug' => 'admin',
            'description' => 'Acesso total ao sistema',
        ]);

        // Create test user
        $user = User::create([
            'name' => 'Administrador',
            'email' => 'admin@minhapesquisa.com.br',
            'password' => '123321',
        ]);

        $user->roles()->attach($adminRole->id);
    }

    public function test_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/login', [
            'email' => 'admin@minhapesquisa.com.br',
            'password' => '123321',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Login realizado com sucesso.',
                'redirect' => '/selecao',
            ])
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'roles',
                ],
            ]);

        $this->assertAuthenticated();
    }

    public function test_login_with_invalid_email(): void
    {
        $response = $this->postJson('/login', [
            'email' => 'invalid@example.com',
            'password' => '123321',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Credenciais inválidas.',
                'errors' => [
                    'email' => ['Email ou senha incorretos.'],
                ],
            ]);

        $this->assertGuest();
    }

    public function test_login_with_invalid_password(): void
    {
        $response = $this->postJson('/login', [
            'email' => 'admin@minhapesquisa.com.br',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Credenciais inválidas.',
                'errors' => [
                    'email' => ['Email ou senha incorretos.'],
                ],
            ]);

        $this->assertGuest();
    }

    public function test_login_validation_errors(): void
    {
        $response = $this->postJson('/login', [
            'email' => 'invalid-email',
            'password' => '123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);

        $this->assertGuest();
    }

    public function test_login_with_missing_fields(): void
    {
        $response = $this->postJson('/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);

        $this->assertGuest();
    }

    public function test_logout(): void
    {
        $user = User::where('email', 'admin@minhapesquisa.com.br')->first();
        $this->actingAs($user);

        $response = $this->postJson('/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Logout realizado com sucesso.',
            ]);

        $this->assertGuest();
    }

    public function test_get_authenticated_user(): void
    {
        $user = User::where('email', 'admin@minhapesquisa.com.br')->first();
        $this->actingAs($user);

        $response = $this->getJson('/user');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'roles',
                ],
            ]);
    }

    public function test_get_user_when_not_authenticated(): void
    {
        $response = $this->getJson('/user');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Usuário não autenticado.',
            ]);
    }
}
