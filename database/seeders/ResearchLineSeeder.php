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
        // Get docentes to be coordinators - specific coordinators for each line
        $docentes = User::whereHas('roles', function ($query) {
            $query->where('slug', 'docente');
        })->limit(5)->get();

        $researchLines = [
            [
                'name' => 'Gestão da Informação e do Conhecimento',
                'alias' => 'GIC',
                'description' => 'Estudos sobre organização, gestão e uso estratégico da informação e conhecimento em organizações. Inclui sistemas de informação, gestão do conhecimento organizacional, inteligência competitiva e arquitetura da informação.',
                'coordinator_id' => $docentes->get(0)?->id,
            ],
            [
                'name' => 'Organização e Representação da Informação',
                'alias' => 'ORI',
                'description' => 'Pesquisas em catalogação, classificação, indexação, linguagens documentárias, ontologias, taxonomias e metadados. Foca nos processos de organização e representação do conhecimento para recuperação da informação.',
                'coordinator_id' => $docentes->get(1)?->id,
            ],
            [
                'name' => 'Mediação e Apropriação da Informação',
                'alias' => 'MAI',
                'description' => 'Investigações sobre os processos de mediação da informação, competência informacional, letramento informacional, apropriação social da informação e estudos de usuários da informação.',
                'coordinator_id' => $docentes->get(2)?->id,
            ],
            [
                'name' => 'Estudos Métricos da Informação',
                'alias' => 'EMI',
                'description' => 'Aplicação de métodos quantitativos para análise da produção, comunicação e uso da informação científica. Inclui bibliometria, cientometria, webometria e altmetria.',
                'coordinator_id' => $docentes->get(3)?->id,
            ],
            [
                'name' => 'Tecnologia da Informação e Sociedade',
                'alias' => 'TIS',
                'description' => 'Estudos sobre o impacto das tecnologias da informação na sociedade, incluindo inclusão digital, governança eletrônica, preservação digital, repositórios digitais e acesso aberto à informação científica.',
                'coordinator_id' => $docentes->get(4)?->id,
            ],
        ];

        foreach ($researchLines as $line) {
            ResearchLine::firstOrCreate(
                ['alias' => $line['alias']],
                $line
            );
        }
    }
}
