<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateUserBasicInfoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::factory()->create(['id' => 1, 'name' => 'admin']);
        Role::factory()->create(['id' => 2, 'name' => 'docente']);
        Role::factory()->create(['id' => 3, 'name' => 'discente']);
    }

    public function test_discente_can_update_basic_info_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3); // Discente role

        $data = [
            'registration' => '1234567890',
            'lattes_url' => 'http://lattes.cnpq.br/1234567890123456',
            'orcid' => '0000-0001-2345-6789',
        ];

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/discente/basic-info', $data);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Informações básicas atualizadas com sucesso.',
                'user' => [
                    'registration' => '1234567890',
                    'lattes_url' => 'http://lattes.cnpq.br/1234567890123456',
                    'orcid' => '0000-0001-2345-6789',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $discente->id,
            'registration' => '1234567890',
            'lattes_url' => 'http://lattes.cnpq.br/1234567890123456',
            'orcid' => '0000-0001-2345-6789',
        ]);
    }

    public function test_unauthenticated_user_cannot_update_basic_info(): void
    {
        $data = [
            'registration' => '1234567890',
        ];

        $response = $this->patchJson('/api/discente/basic-info', $data);

        $response->assertStatus(401);
    }

    public function test_non_discente_user_cannot_update_basic_info(): void
    {
        $docente = User::factory()->create();
        $docente->roles()->attach(2); // Docente role

        $data = [
            'registration' => '1234567890',
        ];

        $response = $this->actingAs($docente, 'sanctum')
            ->patchJson('/api/discente/basic-info', $data);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'This action is unauthorized.',
            ]);
    }

    public function test_validation_fails_for_invalid_registration(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $data = [
            'registration' => 'abc123', // Invalid: contains letters
        ];

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/discente/basic-info', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['registration']);
    }

    public function test_validation_fails_for_invalid_lattes_url(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $data = [
            'lattes_url' => 'http://google.com', // Invalid: wrong domain
        ];

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/discente/basic-info', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['lattes_url']);
    }

    public function test_validation_fails_for_invalid_orcid(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $data = [
            'orcid' => '123-456-789', // Invalid: wrong format
        ];

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/discente/basic-info', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['orcid']);
    }

    public function test_can_update_partial_fields(): void
    {
        $discente = User::factory()->create([
            'registration' => '9999999999',
            'lattes_url' => null,
            'orcid' => null,
        ]);
        $discente->roles()->attach(3);

        // Update only registration
        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/discente/basic-info', [
                'registration' => '1111111111',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $discente->id,
            'registration' => '1111111111',
            'lattes_url' => null,
            'orcid' => null,
        ]);
    }

    public function test_registration_maximum_length_validation(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $data = [
            'registration' => '12345678901', // 11 digits, exceeds max of 10
        ];

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/discente/basic-info', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['registration']);
    }

    public function test_valid_orcid_with_x_checksum(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $data = [
            'orcid' => '0000-0001-2345-678X', // Valid ORCID with X checksum
        ];

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/discente/basic-info', $data);

        $response->assertStatus(200)
            ->assertJson([
                'user' => [
                    'orcid' => '0000-0001-2345-678X',
                ],
            ]);
    }
}
