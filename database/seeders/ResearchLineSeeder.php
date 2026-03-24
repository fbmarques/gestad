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
                'name' => 'Arquitetura & Organização do Conhecimento',
                'alias' => 'AOC',
                'description' => 'Estudos sobre organização, gestão e uso estratégico da informação e conhecimento em organizações. Inclui sistemas de informação, gestão do conhecimento organizacional, inteligência competitiva e arquitetura da informação.',
                'coordinator_id' => $docentes->get(0)?->id,
            ],
            [
                'name' => 'Gestão & Tecnologia da Informação e Comunicação',
                'alias' => 'GETIC',
                'description' => 'A linha GETIC aborda questões relacionadas ao gerenciamento estratégico do conhecimento, envolvendo sua recuperação, organização e disseminação. As atividades nessa linha de pesquisa abrangem investigações relacionadas com gestão da informação e do conhecimento, inteligência competitiva, interação homem-máquina, usos e necessidades da informação, processamento de linguagem natural, indexação automática, big data, analytics, linked data, open data, web, web semântica, visualização de dados, metadados eletrônicos, dentre outras. ',
                'coordinator_id' => $docentes->get(1)?->id,
            ]
        ];

        foreach ($researchLines as $line) {
            ResearchLine::firstOrCreate(
                ['alias' => $line['alias']],
                $line
            );
        }
    }
}
