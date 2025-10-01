<?php

namespace Database\Seeders;

use App\Models\AcademicBond;
use App\Models\Event;
use App\Models\EventParticipation;
use Illuminate\Database\Seeder;

class EventParticipationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $activeBonds = AcademicBond::where('status', 'active')->get();
        $events = Event::all();

        if ($activeBonds->isEmpty() || $events->isEmpty()) {
            $this->command->warn('Não foi possível criar participações em eventos. Verifique se existem vínculos acadêmicos e eventos.');

            return;
        }

        $totalBonds = $activeBonds->count();
        $bondsWithParticipations = (int) ceil($totalBonds * 0.70); // 70% dos discentes

        // Shuffle e separar
        $shuffledBonds = $activeBonds->shuffle();
        $bondsToPopulate = $shuffledBonds->take($bondsWithParticipations);

        $totalParticipations = 0;

        foreach ($bondsToPopulate as $bond) {
            // 50% têm 1 participação, 30% têm 2, 15% têm 3, 5% têm 4
            $rand = rand(1, 100);
            $numberOfParticipations = 1;

            if ($rand <= 5) {
                $numberOfParticipations = 4;
            } elseif ($rand <= 20) {
                $numberOfParticipations = 3;
            } elseif ($rand <= 50) {
                $numberOfParticipations = 2;
            }

            for ($i = 0; $i < $numberOfParticipations; $i++) {
                $this->createParticipation($bond, $events);
                $totalParticipations++;
            }
        }

        $this->command->info('Participações em eventos criadas com sucesso!');
        $this->command->info("Total: {$totalParticipations} participações para {$bondsWithParticipations} discentes");
    }

    private function createParticipation(AcademicBond $bond, $events): void
    {
        $event = $events->random();

        // Tipos disponíveis
        $types = ['Conferência', 'Simpósio', 'Workshop', 'Congresso'];
        $type = $types[array_rand($types)];

        // Ano entre 2022 e 2025
        $year = rand(2022, 2025);

        // Título do trabalho
        $title = $this->generateWorkTitle();

        // Local (cidades variadas)
        $location = $this->generateLocation();

        EventParticipation::create([
            'academic_bond_id' => $bond->id,
            'event_id' => $event->id,
            'title' => $title,
            'name' => $event->nome,
            'location' => $location,
            'year' => $year,
            'type' => $type,
        ]);
    }

    private function generateWorkTitle(): string
    {
        $titles = [
            'Análise Bibliométrica da Produção Científica em Ciência da Informação',
            'Gestão do Conhecimento em Organizações Públicas: Um Estudo de Caso',
            'Competência Informacional de Bibliotecários Universitários',
            'Uso de Tecnologias Digitais em Bibliotecas Escolares',
            'Preservação Digital de Acervos Históricos: Desafios e Perspectivas',
            'Organização da Informação em Repositórios Institucionais',
            'Comportamento Informacional de Pesquisadores em Redes Sociais Acadêmicas',
            'Curadoria Digital: Práticas em Museus e Arquivos',
            'Arquitetura da Informação em Portais de Governo Eletrônico',
            'Metadados para Recuperação da Informação em Bibliotecas Digitais',
            'Ontologias Aplicadas à Organização do Conhecimento',
            'Web Semântica e Linked Data em Ciência da Informação',
            'Indexação Automática: Técnicas de Processamento de Linguagem Natural',
            'Avaliação de Usabilidade em Sistemas de Recuperação da Informação',
            'Repositórios Digitais de Acesso Aberto: Políticas e Práticas',
            'Gestão de Documentos Eletrônicos em Ambientes Corporativos',
            'Mineração de Textos Aplicada à Análise de Conteúdo',
            'Visualização da Informação em Ambientes Digitais',
            'Altmetrics: Novas Métricas para Avaliação da Produção Científica',
            'Sistemas de Recomendação para Bibliotecas Digitais',
            'Folksonomia e Taxonomia: Análise Comparativa',
            'Descoberta e Acesso à Informação em Bases de Dados Científicas',
            'Competência Digital de Professores: Um Levantamento',
            'Informação para Negócios: Fontes e Estratégias de Busca',
            'Preservação de Websites: Metodologias e Ferramentas',
            'Análise de Redes Sociais na Produção Científica Colaborativa',
            'Gestão de Dados de Pesquisa: Políticas e Práticas',
            'Biblioteca 4.0: Tecnologias Emergentes em Bibliotecas',
            'Inteligência Artificial Aplicada à Organização da Informação',
            'Privacidade e Proteção de Dados em Sistemas de Informação',
        ];

        return $titles[array_rand($titles)];
    }

    private function generateLocation(): string
    {
        $locations = [
            // Cidades brasileiras
            'São Paulo, SP',
            'Rio de Janeiro, RJ',
            'Belo Horizonte, MG',
            'Brasília, DF',
            'Salvador, BA',
            'Recife, PE',
            'Porto Alegre, RS',
            'Curitiba, PR',
            'Florianópolis, SC',
            'Fortaleza, CE',
            'Manaus, AM',
            'Belém, PA',
            'Goiânia, GO',
            'Campinas, SP',
            'São Carlos, SP',
            // Cidades internacionais
            'Lisboa, Portugal',
            'Porto, Portugal',
            'Barcelona, Espanha',
            'Madrid, Espanha',
            'Londres, Reino Unido',
            'Paris, França',
            'Roma, Itália',
            'Buenos Aires, Argentina',
            'Santiago, Chile',
            'Cidade do México, México',
            'Toronto, Canadá',
            'Nova York, EUA',
            'Chicago, EUA',
            'Berlim, Alemanha',
            'Amsterdam, Holanda',
        ];

        return $locations[array_rand($locations)];
    }
}
