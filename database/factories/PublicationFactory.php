<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Publication>
 */
class PublicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'academic_bond_id' => \App\Models\AcademicBond::factory(),
            'journal_id' => \App\Models\Journal::factory(),
            'title' => $this->faker->sentence(6),
            'authors' => [$this->faker->name(), $this->faker->name()],
            'submission_date' => $this->faker->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'approval_date' => null,
            'publication_date' => null,
            'status' => $this->faker->randomElement(['S', 'A', 'P', 'E', 'D', 'I']),
            'qualis_rating' => $this->faker->randomElement(['A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'C']),
            'program_evaluation' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'evaluation_notes' => $this->faker->optional()->paragraph(),
            'evaluated_at' => $this->faker->optional()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
