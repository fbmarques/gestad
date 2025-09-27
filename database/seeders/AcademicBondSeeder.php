<?php

namespace Database\Seeders;

use App\Models\AcademicBond;
use App\Models\Agency;
use App\Models\ResearchLine;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AcademicBondSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all discentes (students)
        $discentes = User::whereHas('roles', function ($query) {
            $query->where('slug', 'discente');
        })->get();

        // Get all docentes (advisors)
        $docentes = User::whereHas('roles', function ($query) {
            $query->where('slug', 'docente');
        })->get();

        // Get agencies and research lines
        $agencies = Agency::all();
        $researchLines = ResearchLine::all();

        if ($discentes->isEmpty() || $docentes->isEmpty() || $agencies->isEmpty() || $researchLines->isEmpty()) {
            $this->command->warn('Não foi possível criar vínculos acadêmicos. Verifique se existem discentes, docentes, agências e linhas de pesquisa.');
            return;
        }

        // Create academic bonds for each student
        foreach ($discentes as $index => $discente) {
            // Distribute advisors evenly among students
            $advisor = $docentes->get($index % $docentes->count());

            // Randomly assign agency and research line
            $agency = $agencies->random();
            $researchLine = $researchLines->random();

            // Define level based on index (mix of master and doctorate)
            $levels = ['master', 'doctorate'];
            $level = $levels[$index % 2];

            // Define status (most active, some completed, few suspended)
            $statusOptions = ['active', 'active', 'active', 'completed', 'suspended'];
            $status = $statusOptions[$index % count($statusOptions)];

            // Create start date based on level and status
            $startDate = match($level) {
                'master' => match($status) {
                    'active' => fake()->dateTimeBetween('-2 years', '-6 months'),
                    'completed' => fake()->dateTimeBetween('-3 years', '-2 years'),
                    'suspended' => fake()->dateTimeBetween('-1 year', '-3 months'),
                },
                'doctorate' => match($status) {
                    'active' => fake()->dateTimeBetween('-4 years', '-1 year'),
                    'completed' => fake()->dateTimeBetween('-5 years', '-1 year'),
                    'suspended' => fake()->dateTimeBetween('-2 years', '-6 months'),
                }
            };

            // Create end date for completed bonds
            $endDate = $status === 'completed' ?
                fake()->dateTimeBetween($startDate, 'now') : null;

            // Research titles related to Information Science
            $researchTitles = [
                'Gestão do Conhecimento em Bibliotecas Digitais',
                'Competência Informacional na Era Digital',
                'Organização da Informação em Repositórios Institucionais',
                'Mediação da Informação em Ambientes Virtuais',
                'Estudos Bibliométricos da Produção Científica Brasileira',
                'Preservação Digital de Acervos Históricos',
                'Arquitetura da Informação para Portais Governamentais',
                'Ontologias para Representação do Conhecimento',
                'Literacia Digital em Comunidades Rurais',
                'Sistemas de Recuperação da Informação Baseados em IA',
                'Análise de Redes Sociais Acadêmicas',
                'Gestão de Dados de Pesquisa Científica',
                'Impacto das Tecnologias na Sociedade da Informação',
                'Epistemologia da Ciência da Informação',
                'Políticas de Informação e Acesso Aberto',
                'Visualização de Dados Científicos',
                'Inteligência Competitiva em Organizações',
                'Curadoria Digital de Coleções Especiais',
                'Comportamento Informacional de Usuários',
                'Metadados para Preservação Digital'
            ];

            AcademicBond::create([
                'student_id' => $discente->id,
                'advisor_id' => $advisor->id,
                'agency_id' => $agency->id,
                'research_line_id' => $researchLine->id,
                'level' => $level,
                'status' => $status,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'title' => $researchTitles[$index % count($researchTitles)],
                'description' => 'Pesquisa desenvolvida no âmbito do Programa de Pós-Graduação em Ciência da Informação, com foco em ' . strtolower($researchLine->name) . '.',
            ]);
        }

        $this->command->info('Vínculos acadêmicos criados com sucesso!');
    }
}
