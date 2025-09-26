<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Journal>
 */
class JournalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company().' Journal',
            'institution' => fake()->company(),
            'qualis' => fake()->randomElement(['A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'B5', 'C']),
            'issn' => fake()->regexify('[0-9]{4}-[0-9]{4}'),
            'type' => fake()->randomElement(['national', 'international']),
            'description' => fake()->optional()->sentence(),
        ];
    }
}
