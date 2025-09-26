<?php

namespace Database\Factories;

use App\Models\Agency;
use App\Models\ResearchLine;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AcademicBond>
 */
class AcademicBondFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => User::factory(),
            'advisor_id' => User::factory(),
            'agency_id' => Agency::factory(),
            'research_line_id' => ResearchLine::factory(),
            'level' => $this->faker->randomElement(['master', 'doctorate']),
            'status' => $this->faker->randomElement(['active', 'inactive', 'completed', 'suspended']),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->optional()->date(),
            'title' => $this->faker->optional()->sentence(),
            'description' => $this->faker->optional()->paragraph(),
        ];
    }
}
