<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
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

        Cache::flush();
    }

    public function test_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
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
        $this->assertNotNull(User::where('email', 'admin@minhapesquisa.com.br')->value('last_access_at'));
    }

    public function test_authenticated_api_request_updates_last_access_at(): void
    {
        Carbon::setTestNow('2026-04-21 10:00:00');

        $user = User::where('email', 'admin@minhapesquisa.com.br')->first();
        Sanctum::actingAs($user);

        $this->getJson('/api/user/profile')->assertStatus(200);

        $user->refresh();

        $this->assertNotNull($user->last_access_at);
        $this->assertTrue($user->last_access_at->equalTo(now()));

        Carbon::setTestNow();
    }

    public function test_authenticated_api_requests_do_not_update_last_access_at_more_than_once_within_cache_window(): void
    {
        Carbon::setTestNow('2026-04-21 10:00:00');

        $user = User::where('email', 'admin@minhapesquisa.com.br')->first();
        Sanctum::actingAs($user);

        $this->getJson('/api/user/profile')->assertStatus(200);
        $firstAccessAt = $user->fresh()->last_access_at;

        Carbon::setTestNow('2026-04-21 10:02:00');
        $this->getJson('/api/user/profile')->assertStatus(200);
        $secondAccessAt = $user->fresh()->last_access_at;

        $this->assertTrue($firstAccessAt->equalTo($secondAccessAt));

        Carbon::setTestNow('2026-04-21 10:06:00');
        $this->getJson('/api/user/profile')->assertStatus(200);
        $thirdAccessAt = $user->fresh()->last_access_at;

        $this->assertTrue($thirdAccessAt->equalTo(now()));
        $this->assertFalse($thirdAccessAt->equalTo($secondAccessAt));

        Carbon::setTestNow();
    }

    public function test_login_with_invalid_email(): void
    {
        $response = $this->postJson('/api/login', [
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
        $response = $this->postJson('/api/login', [
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
        $response = $this->postJson('/api/login', [
            'email' => 'invalid-email',
            'password' => '123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);

        $this->assertGuest();
    }

    public function test_login_with_missing_fields(): void
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);

        $this->assertGuest();
    }

    public function test_logout(): void
    {
        $user = User::where('email', 'admin@minhapesquisa.com.br')->first();
        $this->actingAs($user);

        $response = $this->postJson('/api/logout');

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

        $response = $this->getJson('/api/user');

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
        $response = $this->getJson('/api/user');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Usuário não autenticado.',
            ]);
    }
}
