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
            ['nome' => 'Encontro Nacional de Pesquisa em Ciência da Informação', 'alias' => 'ENANCIB', 'tipo' => 'Encontro', 'natureza' => 'Nacional'],
            ['nome' => 'International Conference on Information Science', 'alias' => 'ICIS', 'tipo' => 'Conferência', 'natureza' => 'Internacional'],
            ['nome' => 'Congresso Brasileiro de Biblioteconomia e Documentação', 'alias' => 'CBBD', 'tipo' => 'Congresso', 'natureza' => 'Nacional'],
            ['nome' => 'European Conference on Information Literacy', 'alias' => 'ECIL', 'tipo' => 'Conferência', 'natureza' => 'Internacional'],
            ['nome' => 'Seminário Nacional de Bibliotecas Universitárias', 'alias' => 'SNBU', 'tipo' => 'Seminário', 'natureza' => 'Nacional'],
            ['nome' => 'International Conference on Scientometrics and Informetrics', 'alias' => 'ISSI', 'tipo' => 'Conferência', 'natureza' => 'Internacional'],
            ['nome' => 'Workshop de Teses e Dissertações em Ciência da Informação', 'alias' => 'WTDCI', 'tipo' => 'Workshop', 'natureza' => 'Nacional'],
            ['nome' => 'Conference on Digital Libraries', 'alias' => 'JCDL', 'tipo' => 'Conferência', 'natureza' => 'Internacional'],
            ['nome' => 'Simpósio Brasileiro de Sistemas de Informação', 'alias' => 'SBSI', 'tipo' => 'Simpósio', 'natureza' => 'Nacional'],
            ['nome' => 'International Conference on Knowledge Management', 'alias' => 'ICKM', 'tipo' => 'Conferência', 'natureza' => 'Internacional'],
        ];

        foreach ($eventos as $evento) {
            Event::firstOrCreate(
                ['alias' => $evento['alias']],
                $evento
            );
        }
    }
}
