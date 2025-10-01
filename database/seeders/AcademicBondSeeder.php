<?php

namespace Database\Seeders;

use App\Models\AcademicBond;
use App\Models\Agency;
use App\Models\ResearchLine;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

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

        // Calculate how many students should be completed (15%)
        $totalStudents = $discentes->count();
        $completedCount = (int) ceil($totalStudents * 0.15);

        // Shuffle students and mark first 15% as completed
        $discentesShuffled = $discentes->shuffle();
        $completedStudents = $discentesShuffled->take($completedCount);
        $activeStudents = $discentesShuffled->skip($completedCount);

        // Research problem templates
        $problemTemplates = [
            'A gestão da informação em ambientes digitais apresenta desafios relacionados à organização, preservação e acesso à informação.',
            'A competência informacional dos usuários de bibliotecas universitárias necessita ser desenvolvida para o uso efetivo dos recursos informacionais.',
            'Os sistemas de recuperação da informação enfrentam dificuldades na representação semântica do conteúdo digital.',
            'A curadoria digital de acervos históricos demanda metodologias específicas para garantir a preservação a longo prazo.',
            'As métricas tradicionais de avaliação científica não contemplam adequadamente a produção em meios digitais.',
            'A interoperabilidade entre sistemas de informação é fundamental para a integração de bases de dados heterogêneas.',
            'O comportamento informacional dos pesquisadores tem se modificado com o advento das redes sociais acadêmicas.',
            'A privacidade e proteção de dados pessoais em sistemas de informação requer abordagens técnicas e éticas.',
            'A arquitetura da informação de portais governamentais impacta diretamente na transparência e participação cidadã.',
            'Os repositórios institucionais enfrentam desafios de adesão e preenchimento de metadados pela comunidade acadêmica.',
        ];

        // Research question templates
        $questionTemplates = [
            'Como aprimorar os processos de gestão da informação digital utilizando tecnologias emergentes?',
            'Quais estratégias são mais eficazes para desenvolver competência informacional em estudantes universitários?',
            'De que forma técnicas de processamento de linguagem natural podem melhorar a recuperação da informação?',
            'Quais metodologias de curadoria digital são adequadas para acervos históricos em formato digital?',
            'Como as altmetrics podem complementar as métricas tradicionais de avaliação científica?',
            'Quais padrões e protocolos facilitam a interoperabilidade entre sistemas de informação?',
            'Como as redes sociais acadêmicas influenciam o comportamento informacional dos pesquisadores?',
            'Quais mecanismos técnicos e políticos garantem a privacidade em sistemas de informação?',
            'Como a arquitetura da informação impacta a usabilidade de portais de governo eletrônico?',
            'Quais fatores influenciam a adesão e qualidade dos metadados em repositórios institucionais?',
        ];

        // Objectives templates
        $objectivesTemplates = [
            "Objetivo Geral:\nAnalisar os processos de gestão da informação digital em organizações contemporâneas.\n\nObjetivos Específicos:\n1. Identificar as principais tecnologias utilizadas na gestão da informação\n2. Avaliar a eficácia dos processos implementados\n3. Propor melhorias baseadas em boas práticas internacionais",
            "Objetivo Geral:\nDesenvolver um framework para o desenvolvimento de competência informacional.\n\nObjetivos Específicos:\n1. Mapear as necessidades informacionais dos usuários\n2. Identificar lacunas nas competências existentes\n3. Validar o framework proposto em ambiente real",
            "Objetivo Geral:\nInvestigar técnicas de recuperação da informação baseadas em semântica.\n\nObjetivos Específicos:\n1. Revisar técnicas de processamento de linguagem natural\n2. Desenvolver protótipo de sistema de recuperação\n3. Avaliar a precisão e revocação do sistema proposto",
            "Objetivo Geral:\nPropor metodologia de curadoria digital para acervos históricos.\n\nObjetivos Específicos:\n1. Analisar metodologias existentes de curadoria digital\n2. Adaptar metodologias ao contexto de acervos históricos\n3. Testar a metodologia em estudo de caso",
            "Objetivo Geral:\nAvaliar o uso de altmetrics na avaliação da produção científica.\n\nObjetivos Específicos:\n1. Comparar métricas tradicionais e altmetrics\n2. Identificar correlações entre diferentes indicadores\n3. Propor modelo integrado de avaliação",
        ];

        // Methodology templates
        $methodologyTemplates = [
            "Esta pesquisa adota abordagem qualitativa com estudo de caso múltiplo. A coleta de dados será realizada por meio de entrevistas semiestruturadas e análise documental. Os dados serão analisados utilizando análise de conteúdo segundo Bardin (2011).",
            "A metodologia adotada é de natureza aplicada com abordagem quantitativa. Será realizado survey com questionário validado. A análise dos dados utilizará estatística descritiva e inferencial com apoio do software SPSS.",
            "Pesquisa exploratória de natureza quali-quantitativa. A fase qualitativa incluirá grupos focais e a quantitativa aplicará questionários. A análise combinará análise temática e análise estatística multivariada.",
            "Pesquisa-ação com desenvolvimento de artefato tecnológico. O ciclo incluirá: diagnóstico, planejamento, implementação, avaliação e reflexão. A validação será feita por especialistas e testes com usuários.",
            "Revisão sistemática da literatura seguida de estudo bibliométrico. As bases consultadas serão Scopus, Web of Science e BRAPCI. A análise incluirá métricas de citação, cocitação e acoplamento bibliográfico.",
        ];

        $bondIndex = 0;

        // Create bonds for completed students (15%)
        foreach ($completedStudents as $discente) {
            $this->createAcademicBond(
                $discente,
                $docentes,
                $agencies,
                $researchLines,
                $bondIndex,
                true, // is completed
                $problemTemplates,
                $questionTemplates,
                $objectivesTemplates,
                $methodologyTemplates
            );
            $bondIndex++;
        }

        // Create bonds for active students (85%)
        foreach ($activeStudents as $discente) {
            $this->createAcademicBond(
                $discente,
                $docentes,
                $agencies,
                $researchLines,
                $bondIndex,
                false, // not completed
                $problemTemplates,
                $questionTemplates,
                $objectivesTemplates,
                $methodologyTemplates
            );
            $bondIndex++;
        }

        $this->command->info("Vínculos acadêmicos criados com sucesso!");
        $this->command->info("Total: {$totalStudents} vínculos ({$completedCount} concluídos, " . ($totalStudents - $completedCount) . " ativos)");
    }

    private function createAcademicBond(
        $discente,
        $docentes,
        $agencies,
        $researchLines,
        $index,
        $isCompleted,
        $problemTemplates,
        $questionTemplates,
        $objectivesTemplates,
        $methodologyTemplates
    ): void {
        // Distribute advisors evenly among students
        $advisor = $docentes->get($index % $docentes->count());

        // 30% chance of having a co-advisor
        $coAdvisor = rand(1, 100) <= 30 ? $docentes->where('id', '!=', $advisor->id)->random() : null;

        // Randomly assign research line
        $researchLine = $researchLines->random();

        // Extract level from observation (Mestranda/Doutoranda)
        $observation = $discente->observation ?? '';
        $level = str_contains($observation, 'Doutor') ? 'doctorate' : 'master';

        // Generate matricula (enrollment number)
        // Format: YYYYNNNNN (4 digits year + 5 random digits = 9 total)
        $year = rand(2022, 2025);
        $randomDigits = str_pad(rand(0, 99999), 5, '0', STR_PAD_LEFT);
        $matricula = $year . $randomDigits;

        // Calculate dates
        $startDate = Carbon::create($year, rand(1, 12), rand(1, 28));
        $durationMonths = $level === 'master' ? 24 : 48;
        $endDate = $startDate->copy()->addMonths($durationMonths);

        // 70% chance of having scholarship
        $hasScholarship = rand(1, 100) <= 70;
        $agencyId = $hasScholarship ? $agencies->random()->id : null;

        // Research definitions (60-70% filled for active, 100% for completed)
        $fillPercentage = $isCompleted ? 100 : rand(60, 70);
        $researchDefinitions = $this->generateResearchDefinitions(
            $fillPercentage,
            $problemTemplates,
            $questionTemplates,
            $objectivesTemplates,
            $methodologyTemplates,
            $index
        );

        // Academic requirements (only for completed)
        $academicRequirements = $isCompleted
            ? $this->generateCompletedRequirements($startDate, $endDate, $level)
            : $this->generateActiveRequirements();

        // Title for the research
        $title = $this->generateTitle($index, $level);

        // Status
        $status = $isCompleted ? 'completed' : 'active';

        AcademicBond::create([
            'student_id' => $discente->id,
            'advisor_id' => $advisor->id,
            'co_advisor_id' => $coAdvisor?->id,
            'agency_id' => $agencyId,
            'research_line_id' => $researchLine->id,
            'level' => $level,
            'status' => $status,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'title' => $title,
            'description' => null,
            'problem_defined' => $researchDefinitions['problem_defined'],
            'problem_text' => $researchDefinitions['problem_text'],
            'question_defined' => $researchDefinitions['question_defined'],
            'question_text' => $researchDefinitions['question_text'],
            'objectives_defined' => $researchDefinitions['objectives_defined'],
            'objectives_text' => $researchDefinitions['objectives_text'],
            'methodology_defined' => $researchDefinitions['methodology_defined'],
            'methodology_text' => $researchDefinitions['methodology_text'],
            'qualification_status' => $academicRequirements['qualification_status'],
            'qualification_date' => $academicRequirements['qualification_date'],
            'qualification_completion_date' => $academicRequirements['qualification_completion_date'],
            'defense_status' => $academicRequirements['defense_status'],
            'defense_date' => $academicRequirements['defense_date'],
            'defense_completion_date' => $academicRequirements['defense_completion_date'],
            'work_completed' => $academicRequirements['work_completed'],
        ]);
    }

    private function generateResearchDefinitions(
        $fillPercentage,
        $problemTemplates,
        $questionTemplates,
        $objectivesTemplates,
        $methodologyTemplates,
        $index
    ): array {
        $fields = ['problem', 'question', 'objectives', 'methodology'];
        $toFill = (int) ceil(count($fields) * ($fillPercentage / 100));

        // Shuffle and take the first N fields to fill
        shuffle($fields);
        $filledFields = array_slice($fields, 0, $toFill);

        return [
            'problem_defined' => in_array('problem', $filledFields),
            'problem_text' => in_array('problem', $filledFields)
                ? $problemTemplates[$index % count($problemTemplates)]
                : null,
            'question_defined' => in_array('question', $filledFields),
            'question_text' => in_array('question', $filledFields)
                ? $questionTemplates[$index % count($questionTemplates)]
                : null,
            'objectives_defined' => in_array('objectives', $filledFields),
            'objectives_text' => in_array('objectives', $filledFields)
                ? $objectivesTemplates[$index % count($objectivesTemplates)]
                : null,
            'methodology_defined' => in_array('methodology', $filledFields),
            'methodology_text' => in_array('methodology', $filledFields)
                ? $methodologyTemplates[$index % count($methodologyTemplates)]
                : null,
        ];
    }

    private function generateCompletedRequirements($startDate, $endDate, $level): array
    {
        // For completed students, all steps must be done
        $qualificationDate = $startDate->copy()->addMonths($level === 'master' ? 12 : 24);
        $qualificationCompletionDate = $qualificationDate->copy()->addDays(rand(1, 7));

        $defenseDate = $endDate->copy()->subMonths(1);
        $defenseCompletionDate = $defenseDate->copy()->addDays(rand(1, 7));

        return [
            'qualification_status' => 'Completed',
            'qualification_date' => $qualificationDate,
            'qualification_completion_date' => $qualificationCompletionDate,
            'defense_status' => 'Completed',
            'defense_date' => $defenseDate,
            'defense_completion_date' => $defenseCompletionDate,
            'work_completed' => true,
        ];
    }

    private function generateActiveRequirements(): array
    {
        // For active students, requirements are not yet completed
        // Some might have qualification scheduled/completed
        $hasQualification = rand(1, 100) <= 40; // 40% have qualification

        if ($hasQualification) {
            $qualificationCompleted = rand(1, 100) <= 50; // 50% of those completed it

            if ($qualificationCompleted) {
                return [
                    'qualification_status' => 'Completed',
                    'qualification_date' => Carbon::now()->subMonths(rand(1, 6)),
                    'qualification_completion_date' => Carbon::now()->subMonths(rand(1, 6))->addDays(rand(1, 7)),
                    'defense_status' => 'Not Scheduled',
                    'defense_date' => null,
                    'defense_completion_date' => null,
                    'work_completed' => false,
                ];
            } else {
                return [
                    'qualification_status' => 'Scheduled',
                    'qualification_date' => Carbon::now()->addMonths(rand(1, 3)),
                    'qualification_completion_date' => null,
                    'defense_status' => 'Not Scheduled',
                    'defense_date' => null,
                    'defense_completion_date' => null,
                    'work_completed' => false,
                ];
            }
        }

        return [
            'qualification_status' => 'Not Scheduled',
            'qualification_date' => null,
            'qualification_completion_date' => null,
            'defense_status' => 'Not Scheduled',
            'defense_date' => null,
            'defense_completion_date' => null,
            'work_completed' => false,
        ];
    }

    private function generateTitle($index, $level): string
    {
        $titles = [
            'Gestão da Informação Digital em Organizações do Conhecimento',
            'Competência Informacional em Ambientes Acadêmicos: Um Estudo de Caso',
            'Recuperação da Informação Baseada em Ontologias: Proposta de Framework',
            'Curadoria Digital de Acervos Históricos: Metodologias e Práticas',
            'Altmetrics e Avaliação Científica: Análise Comparativa de Indicadores',
            'Interoperabilidade em Sistemas de Informação Distribuídos',
            'Comportamento Informacional de Pesquisadores em Redes Sociais Acadêmicas',
            'Privacidade e Proteção de Dados em Sistemas de Informação: Aspectos Técnicos e Éticos',
            'Arquitetura da Informação em Portais de Governo Eletrônico',
            'Repositórios Institucionais: Fatores Críticos de Sucesso e Adesão',
            'Mineração de Textos Aplicada à Organização do Conhecimento',
            'Linked Data e Web Semântica: Aplicações em Ciência da Informação',
            'Preservação Digital a Longo Prazo: Estratégias e Desafios',
            'Ontologias de Domínio para Representação da Informação Científica',
            'Visualização da Informação em Ambientes Digitais de Aprendizagem',
            'Folksonomia e Taxonomia: Análise Comparativa de Sistemas de Classificação',
            'Bibliometria e Cientometria: Mapeamento da Produção Científica',
            'Gestão do Conhecimento em Comunidades de Prática Virtuais',
            'Usabilidade em Bibliotecas Digitais: Avaliação Heurística',
            'Arquivologia Digital: Princípios e Aplicações Contemporâneas',
        ];

        return $titles[$index % count($titles)];
    }
}
