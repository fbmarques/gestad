<?php

namespace Database\Seeders;

use App\Models\AcademicBond;
use App\Models\Journal;
use App\Models\Publication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PublicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $academicBonds = AcademicBond::with(['student', 'advisor'])->get();
        $journals = Journal::all();

        if ($academicBonds->isEmpty() || $journals->isEmpty()) {
            $this->command->warn('Não foi possível criar publicações. Verifique se existem vínculos acadêmicos e periódicos.');
            return;
        }

        $totalBonds = $academicBonds->count();

        // Calculate quantities based on percentages
        $bondsWithOnePublication = (int) ceil($totalBonds * 0.80); // 80%
        $bondsWithTwoPublications = (int) ceil($totalBonds * 0.50); // 50%
        $bondsWithThreePublications = (int) ceil($totalBonds * 0.10); // 10%
        $bondsWithFourPublications = (int) ceil($totalBonds * 0.02); // 2%

        // Shuffle bonds to distribute publications randomly
        $shuffledBonds = $academicBonds->shuffle();

        $publicationCount = 0;
        $submittedCount = 0;
        $approvedCount = 0;
        $publishedCount = 0;
        $deferredCount = 0;
        $rejectedCount = 0;

        foreach ($shuffledBonds as $index => $bond) {
            $numberOfPublications = 0;

            if ($index < $bondsWithFourPublications) {
                $numberOfPublications = 4;
            } elseif ($index < $bondsWithThreePublications) {
                $numberOfPublications = 3;
            } elseif ($index < $bondsWithTwoPublications) {
                $numberOfPublications = 2;
            } elseif ($index < $bondsWithOnePublication) {
                $numberOfPublications = 1;
            }

            for ($i = 0; $i < $numberOfPublications; $i++) {
                $statusDistribution = $this->determineStatus($publicationCount);

                $publication = $this->createPublication($bond, $journals, $statusDistribution);

                // Count statistics
                $publicationCount++;
                match($publication->status) {
                    'S' => $submittedCount++,
                    'A' => $approvedCount++,
                    'P', 'D', 'I' => $publishedCount++,
                    default => null,
                };

                if ($publication->status === 'D') {
                    $deferredCount++;
                } elseif ($publication->status === 'I') {
                    $rejectedCount++;
                }
            }
        }

        $this->command->info("Publicações criadas com sucesso!");
        $this->command->info("Total: {$publicationCount} publicações");
        $this->command->info("- Submetidas (S): {$submittedCount}");
        $this->command->info("- Aprovadas (A): {$approvedCount}");
        $this->command->info("- Publicadas (P): " . ($publishedCount - $deferredCount - $rejectedCount));
        $this->command->info("- Deferidas (D): {$deferredCount}");
        $this->command->info("- Indeferidas (I): {$rejectedCount}");
    }

    private function determineStatus($currentCount): string
    {
        // Of all publications: 30% submitted, 30% approved, 40% published
        $rand = rand(1, 100);

        if ($rand <= 30) {
            return 'S'; // Submitted
        } elseif ($rand <= 60) {
            return 'A'; // Approved
        } else {
            // 40% published - of these: 25% P (pure published), 60% D, 15% I
            $publishedRand = rand(1, 100);
            if ($publishedRand <= 25) {
                return 'P'; // Published (without committee evaluation yet)
            } elseif ($publishedRand <= 85) {
                return 'D'; // Deferred (published and approved by committee)
            } else {
                return 'I'; // Rejected (published but rejected by committee)
            }
        }
    }

    private function createPublication(AcademicBond $bond, $journals, string $status): Publication
    {
        $journal = $journals->random();
        $student = $bond->student;
        $advisor = $bond->advisor;

        // Generate realistic publication title
        $title = $this->generateTitle();

        // Authors array: student + advisor (sometimes co-advisor)
        $authors = [
            $student->name,
            $advisor->name,
        ];

        if ($bond->coAdvisor && rand(1, 100) <= 50) {
            $authors[] = $bond->coAdvisor->name;
        }

        // Dates based on status
        $dates = $this->generateDates($status, $bond->start_date);

        // DOI for published articles
        $doi = in_array($status, ['P', 'D', 'I'])
            ? $this->generateDOI()
            : null;

        // Volume and pages for published articles
        $volume = in_array($status, ['P', 'D', 'I']) ? rand(1, 50) : null;
        $number = in_array($status, ['P', 'D', 'I']) ? rand(1, 12) : null;
        $pagesStart = in_array($status, ['P', 'D', 'I']) ? rand(1, 300) : null;
        $pagesEnd = $pagesStart ? $pagesStart + rand(10, 30) : null;

        // Program evaluation for deferred/rejected/published
        $programEvaluation = 'pending'; // Default
        $evaluationNotes = null;
        $evaluatedAt = null;

        if ($status === 'D') {
            $programEvaluation = 'approved';
            $evaluationNotes = 'Publicação aprovada pelo colegiado. Atende aos critérios de qualidade do programa.';
            $evaluatedAt = Carbon::parse($dates['publication_date'])->addDays(rand(7, 30));
        } elseif ($status === 'I') {
            $programEvaluation = 'rejected';
            $evaluationNotes = 'Publicação não aprovada pelo colegiado. Não atende plenamente aos critérios estabelecidos.';
            $evaluatedAt = Carbon::parse($dates['publication_date'])->addDays(rand(7, 30));
        }

        return Publication::create([
            'academic_bond_id' => $bond->id,
            'journal_id' => $journal->id,
            'title' => $title,
            'abstract' => $this->generateAbstract(),
            'authors' => $authors,
            'doi' => $doi,
            'volume' => $volume,
            'number' => $number,
            'pages_start' => $pagesStart,
            'pages_end' => $pagesEnd,
            'submission_date' => $dates['submission_date'],
            'approval_date' => $dates['approval_date'],
            'publication_date' => $dates['publication_date'],
            'qualis_rating' => $journal->qualis,
            'status' => $status,
            'program_evaluation' => $programEvaluation,
            'evaluation_notes' => $evaluationNotes,
            'evaluated_at' => $evaluatedAt,
        ]);
    }

    private function generateDates(string $status, $bondStartDate): array
    {
        $startDate = Carbon::parse($bondStartDate);

        // Submission date: between 6-18 months after bond start
        $submissionDate = $startDate->copy()->addMonths(rand(6, 18));

        $approvalDate = null;
        $publicationDate = null;

        if ($status === 'A') {
            // Approved: 3-6 months after submission
            $approvalDate = $submissionDate->copy()->addMonths(rand(3, 6));
        } elseif (in_array($status, ['P', 'D', 'I'])) {
            // Published: approval 3-6 months after submission, publication 2-4 months after approval
            $approvalDate = $submissionDate->copy()->addMonths(rand(3, 6));
            $publicationDate = $approvalDate->copy()->addMonths(rand(2, 4));
        }

        return [
            'submission_date' => $submissionDate,
            'approval_date' => $approvalDate,
            'publication_date' => $publicationDate,
        ];
    }

    private function generateTitle(): string
    {
        $titles = [
            'Análise da Gestão do Conhecimento em Organizações Intensivas em Conhecimento',
            'Competência Informacional: Um Estudo sobre Práticas em Bibliotecas Universitárias',
            'Aplicação de Ontologias na Recuperação da Informação em Repositórios Digitais',
            'Curadoria Digital de Acervos Históricos: Desafios e Perspectivas',
            'Métricas Alternativas na Avaliação da Produção Científica Brasileira',
            'Interoperabilidade em Sistemas de Informação: Análise de Padrões e Protocolos',
            'Comportamento Informacional de Pesquisadores no Contexto das Redes Sociais Acadêmicas',
            'Privacidade e Proteção de Dados em Sistemas de Informação: Uma Abordagem Ética',
            'Arquitetura da Informação em Portais de Governo Eletrônico: Estudo de Usabilidade',
            'Fatores Críticos de Sucesso em Repositórios Institucionais de Acesso Aberto',
            'Mineração de Textos Aplicada à Organização e Representação do Conhecimento',
            'Linked Data na Web Semântica: Aplicações em Ciência da Informação',
            'Estratégias de Preservação Digital a Longo Prazo em Instituições de Memória',
            'Ontologias de Domínio para Representação da Informação Científica em Repositórios',
            'Visualização da Informação em Ambientes Digitais de Aprendizagem',
            'Folksonomia versus Taxonomia: Análise Comparativa de Sistemas de Organização',
            'Bibliometria e Cientometria: Mapeamento da Produção Científica em Ciência da Informação',
            'Gestão do Conhecimento em Comunidades de Prática Virtuais: Um Estudo de Caso',
            'Avaliação de Usabilidade em Bibliotecas Digitais Acadêmicas',
            'Princípios Arquivísticos na Era Digital: Desafios e Aplicações Contemporâneas',
            'Modelagem de Dados para Sistemas de Informação Bibliográfica',
            'Indexação Automática: Técnicas de Processamento de Linguagem Natural',
            'Gestão de Documentos Eletrônicos em Ambientes Corporativos',
            'Web Semântica e Organização do Conhecimento: Convergências e Divergências',
            'Análise de Redes Sociais Aplicada à Produção Científica Colaborativa',
            'Metadados para Preservação Digital: Padrões e Implementações',
            'Comportamento de Busca de Informação em Ambientes Digitais',
            'Sistemas de Recomendação Baseados em Filtragem Colaborativa para Bibliotecas Digitais',
            'Análise de Citações e Cocitações em Redes de Conhecimento Científico',
            'Gestão de Recursos Informacionais em Ambientes de Big Data',
        ];

        return $titles[array_rand($titles)];
    }

    private function generateAbstract(): string
    {
        $abstracts = [
            'Este artigo apresenta uma análise sobre a gestão da informação e do conhecimento em organizações contemporâneas. A pesquisa utiliza abordagem qualitativa com estudo de caso. Os resultados indicam que a gestão efetiva do conhecimento depende de fatores tecnológicos, organizacionais e humanos.',
            'O presente trabalho investiga práticas de competência informacional em bibliotecas universitárias brasileiras. Foram realizadas entrevistas com bibliotecários e usuários. Conclui-se que é necessário investimento em programas de formação continuada para desenvolvimento de competências informacionais.',
            'Esta pesquisa propõe o uso de ontologias para melhorar a recuperação da informação em repositórios digitais. Foi desenvolvido um protótipo utilizando Web Ontology Language (OWL). Os testes demonstraram melhoria significativa na precisão e revocação do sistema.',
            'O artigo discute desafios e perspectivas da curadoria digital de acervos históricos. A metodologia incluiu revisão sistemática da literatura e estudo de caso. Os resultados apontam para a necessidade de políticas institucionais claras e investimento em infraestrutura tecnológica.',
            'Este estudo avalia o uso de métricas alternativas (altmetrics) na avaliação da produção científica. Foram analisados dados de redes sociais acadêmicas e bases de citações. Verificou-se correlação moderada entre métricas tradicionais e alternativas.',
        ];

        return $abstracts[array_rand($abstracts)];
    }

    private function generateDOI(): string
    {
        $prefix = '10.' . rand(1000, 9999);
        $suffix = 'jci.' . rand(2020, 2025) . '.' . rand(1, 12) . '.' . rand(1000, 9999);
        return $prefix . '/' . $suffix;
    }
}
