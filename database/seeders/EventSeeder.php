<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $eventos = [
            ['nome' => 'International Conference on Software Engineering', 'alias' => 'ICSE', 'tipo' => 'Conferência', 'natureza' => 'Internacional'],
            ['nome' => 'Simpósio Brasileiro de Engenharia de Software', 'alias' => 'SBES', 'tipo' => 'Simpósio', 'natureza' => 'Nacional'],
            ['nome' => 'ACM SIGMOD International Conference', 'alias' => 'SIGMOD', 'tipo' => 'Conferência', 'natureza' => 'Internacional'],
            ['nome' => 'Workshop de Teses e Dissertações', 'alias' => 'WTD', 'tipo' => 'Workshop', 'natureza' => 'Nacional'],
            ['nome' => 'International Conference on Machine Learning', 'alias' => 'ICML', 'tipo' => 'Conferência', 'natureza' => 'Internacional'],
            ['nome' => 'Congresso da Sociedade Brasileira de Computação', 'alias' => 'CSBC', 'tipo' => 'Congresso', 'natureza' => 'Nacional'],
            ['nome' => 'IEEE International Conference on Computer Vision', 'alias' => 'ICCV', 'tipo' => 'Conferência', 'natureza' => 'Internacional'],
            ['nome' => 'Simpósio Brasileiro de Redes de Computadores', 'alias' => 'SBRC', 'tipo' => 'Simpósio', 'natureza' => 'Nacional'],
            ['nome' => 'Conference on Neural Information Processing Systems', 'alias' => 'NeurIPS', 'tipo' => 'Conferência', 'natureza' => 'Internacional'],
            ['nome' => 'Workshop de Informática na Escola', 'alias' => 'WIE', 'tipo' => 'Workshop', 'natureza' => 'Nacional'],
            ['nome' => 'International World Wide Web Conference', 'alias' => 'WWW', 'tipo' => 'Conferência', 'natureza' => 'Internacional'],
            ['nome' => 'Simpósio Brasileiro de Banco de Dados', 'alias' => 'SBBD', 'tipo' => 'Simpósio', 'natureza' => 'Nacional'],
            ['nome' => 'ACM Conference on Human Factors in Computing', 'alias' => 'CHI', 'tipo' => 'Conferência', 'natureza' => 'Internacional'],
            ['nome' => 'Workshop de Computação Aplicada', 'alias' => 'WCA', 'tipo' => 'Workshop', 'natureza' => 'Nacional'],
            ['nome' => 'International Conference on Robotics and Automation', 'alias' => 'ICRA', 'tipo' => 'Conferência', 'natureza' => 'Internacional'],
        ];

        foreach ($eventos as $evento) {
            Event::create($evento);
        }

        // Criar alguns eventos excluídos para testar
        Event::factory()->count(3)->create()->each(function ($evento) {
            $evento->delete();
        });
    }
}
