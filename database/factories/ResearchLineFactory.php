<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ResearchLine>
 */
class ResearchLineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence(3),
            'alias' => $this->faker->word(),
            'description' => $this->faker->paragraph(),
            'coordinator_id' => null, // Can be set manually in tests
        ];
    }
}
