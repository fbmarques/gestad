<?php

namespace Database\Seeders;

use App\Models\ResearchLine;
use App\Models\User;
use Illuminate\Database\Seeder;

class ResearchLineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get a docente to be coordinator (if exists)
        $docente = User::whereHas('roles', function ($query) {
            $query->where('role_id', 2);
        })->first();

        $researchLines = [
            [
                'name' => 'Inteligência Artificial',
                'alias' => 'IA',
                'description' => 'Pesquisa em algoritmos e técnicas de inteligência artificial',
                'coordinator_id' => $docente?->id,
            ],
            [
                'name' => 'Sistemas Distribuídos',
                'alias' => 'SD',
                'description' => 'Estudo de sistemas distribuídos e computação paralela',
                'coordinator_id' => null,
            ],
            [
                'name' => 'Engenharia de Software',
                'alias' => 'ES',
                'description' => 'Métodos e práticas de desenvolvimento de software',
                'coordinator_id' => null,
            ],
            [
                'name' => 'Banco de Dados',
                'alias' => 'BD',
                'description' => 'Sistemas de gerenciamento de banco de dados e mineração de dados',
                'coordinator_id' => $docente?->id,
            ],
            [
                'name' => 'Segurança da Informação',
                'alias' => 'SI',
                'description' => 'Criptografia, segurança de redes e proteção de dados',
                'coordinator_id' => null,
            ],
            [
                'name' => 'Computação Gráfica',
                'alias' => 'CG',
                'description' => 'Processamento de imagens e visualização computacional',
                'coordinator_id' => null,
            ],
            [
                'name' => 'Redes de Computadores',
                'alias' => 'RC',
                'description' => 'Protocolos de rede, comunicação e infraestrutura',
                'coordinator_id' => null,
            ],
            [
                'name' => 'Interação Humano-Computador',
                'alias' => 'IHC',
                'description' => 'Usabilidade, experiência do usuário e interfaces',
                'coordinator_id' => null,
            ],
        ];

        foreach ($researchLines as $line) {
            ResearchLine::create($line);
        }
    }
}
