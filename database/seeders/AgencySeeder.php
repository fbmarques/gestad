<?php

namespace Database\Seeders;

use App\Models\Agency;
use Illuminate\Database\Seeder;

class AgencySeeder extends Seeder
{
    public function run(): void
    {
        $agencies = [
            ['alias' => 'CNPq', 'name' => 'Conselho Nacional de Desenvolvimento Científico e Tecnológico', 'description' => 'Órgão ligado ao Ministério da Ciência, Tecnologia e Inovação'],
            ['alias' => 'CAPES', 'name' => 'Coordenação de Aperfeiçoamento de Pessoal de Nível Superior', 'description' => 'Fundação ligada ao Ministério da Educação'],
            ['alias' => 'FAPESP', 'name' => 'Fundação de Amparo à Pesquisa do Estado de São Paulo', 'description' => 'Agência de fomento à pesquisa do Estado de São Paulo'],
            ['alias' => 'FAPERJ', 'name' => 'Fundação Carlos Chagas Filho de Amparo à Pesquisa do Estado do Rio de Janeiro', 'description' => 'Agência de fomento à pesquisa do Estado do Rio de Janeiro'],
            ['alias' => 'FAPEMIG', 'name' => 'Fundação de Amparo à Pesquisa do Estado de Minas Gerais', 'description' => 'Agência de fomento à pesquisa do Estado de Minas Gerais'],
            ['alias' => 'FAPESB', 'name' => 'Fundação de Amparo à Pesquisa do Estado da Bahia', 'description' => 'Agência de fomento à pesquisa do Estado da Bahia'],
            ['alias' => 'FAPEAM', 'name' => 'Fundação de Amparo à Pesquisa do Estado do Amazonas', 'description' => 'Agência de fomento à pesquisa do Estado do Amazonas'],
            ['alias' => 'FAPESC', 'name' => 'Fundação de Amparo à Pesquisa e Inovação do Estado de Santa Catarina', 'description' => 'Agência de fomento à pesquisa do Estado de Santa Catarina'],
            ['alias' => 'FAPEG', 'name' => 'Fundação de Amparo à Pesquisa do Estado de Goiás', 'description' => 'Agência de fomento à pesquisa do Estado de Goiás'],
            ['alias' => 'FACEPE', 'name' => 'Fundação de Amparo à Ciência e Tecnologia do Estado de Pernambuco', 'description' => 'Agência de fomento à pesquisa do Estado de Pernambuco'],
        ];

        foreach ($agencies as $agency) {
            Agency::firstOrCreate(
                ['alias' => $agency['alias']],
                $agency
            );
        }
    }
}
