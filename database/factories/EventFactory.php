<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tipos = ['Conferência', 'Simpósio', 'Workshop', 'Congresso'];
        $naturezas = ['Nacional', 'Internacional'];

        $nomes = [
            'International Conference on Software Engineering',
            'Simpósio Brasileiro de Engenharia de Software',
            'ACM SIGMOD International Conference',
            'Workshop de Teses e Dissertações',
            'International Conference on Machine Learning',
            'Congresso da Sociedade Brasileira de Computação',
            'IEEE International Conference on Computer Vision',
            'Simpósio Brasileiro de Redes de Computadores',
            'Conference on Neural Information Processing Systems',
            'Workshop de Informática na Escola',
        ];

        $aliases = [
            'ICSE', 'SBES', 'SIGMOD', 'WTD', 'ICML',
            'CSBC', 'ICCV', 'SBRC', 'NeurIPS', 'WIE',
        ];

        return [
            'nome' => $this->faker->randomElement($nomes),
            'alias' => $this->faker->randomElement($aliases),
            'tipo' => $this->faker->randomElement($tipos),
            'natureza' => $this->faker->randomElement($naturezas),
        ];
    }
}
