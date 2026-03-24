<?php

namespace Database\Seeders;

use App\Models\ResearchLine;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usuários administrativos
        $adminUsers = [
            [
                'name' => 'Administrador',
                'email' => 'admin@minhapesquisa.com.br',
                'password' => '123321',
                'role_slug' => 'admin',
            ],
        ];

        // 10 Docentes da área de Ciência da Informação
        // research_line_id será definido após as linhas serem criadas
        $docentes = [
            [
                'name' => 'Profa. Dra. Benildes Coura Moreira dos Santos Maculan',
                'email' => 'benildes@gmail.com',
                'password' => '123321',
                'role_slug' => 'docente',
                'lattes_url' => 'http://lattes.cnpq.br/5336218259257800',
                'orcid' => '0000-0003-4303-9071',
                'observation' => '',
                'research_line_alias' => 'AOC', // Gestão da Informação e do Conhecimento
            ],
            [
                'name' => 'Profa. Dra. Gercina Ângela de Lima',
                'email' => 'limagercina@gmail.com',
                'password' => '123321',
                'role_slug' => 'docente',
                'lattes_url' => 'http://lattes.cnpq.br/3183050056105009',
                'orcid' => '0000-0003-0735-3856',
                'observation' => '',
                'research_line_alias' => 'AOC', // Organização e Representação da Informação
            ],
        ];

        // 20 Discentes (estudantes de pós-graduação)
        $discentes = [
            [
                'name' => 'BARBARA VITORIA GONÇALVES CARVALHO E SILVA',
                'email' => 'barbaraesilva17@gmail.com',
                'password' => '12345678',
                'role_slug' => 'discente',
                'lattes_url' => '',
                'observation' => '',
            ],
            [
                'name' => 'DANIELA ALVES FONSECA',
                'email' => 'danieladaf2020@gmail.com',
                'password' => '12345678',
                'role_slug' => 'discente',
                'lattes_url' => '',
                'observation' => '',
            ],
            [
                'name' => 'FREDERICO DE ALMEIDA LARANJO',
                'email' => 'fred_laranjo@hotmail.com',
                'password' => '12345678',
                'role_slug' => 'discente',
                'lattes_url' => '',
                'observation' => '',
            ],
            [
                'name' => 'JUNIO LOPES NASCIMENTO',
                'email' => 'juniolopescj@gmail.com',
                'password' => '12345678',
                'role_slug' => 'discente',
                'lattes_url' => '',
                'observation' => '',
            ],
            [
                'name' => 'POLLIANE DE JESUS DORNELES OLIVEIRA',
                'email' => 'polliane01@yahoo.com.br',
                'password' => '12345678',
                'role_slug' => 'discente',
                'lattes_url' => '',
                'observation' => '',
            ],
            [
                'name' => 'VINICIUS CORREIA BRAGA',
                'email' => '06correa@gmail.com',
                'password' => '12345678',
                'role_slug' => 'discente',
                'lattes_url' => '',
                'observation' => '',
            ],
            [
                'name' => 'RUBENS HENRIQUE MARTINS DE MELLO',
                'email' => 'rubensmello.ufmg@gmail.com',
                'password' => '12345678',
                'role_slug' => 'discente',
                'lattes_url' => '',
                'observation' => '',
            ],
            [
                'name' => 'ANA CAROLINA DA SILVA LIMA',
                'email' => 'anacarolinasl2201@gmail.com',
                'password' => '12345678',
                'role_slug' => 'discente',
                'lattes_url' => '',
                'observation' => '',
            ],
            [
                'name' => 'MICHELLE DE PAULA MACHADO VENUTO',
                'email' => 'michellevenuto@gmail.com',
                'password' => '12345678',
                'role_slug' => 'discente',
                'lattes_url' => '',
                'observation' => '',
            ],
            [
                'name' => 'MARIA ISABEL SILVA DIMAS',
                'email' => 'isabel.eng.agro@gmail.com',
                'password' => '12345678',
                'role_slug' => 'discente',
                'lattes_url' => '',
                'observation' => '',
            ],
            [
                'name' => 'LUCIANA PEREIRA BOAVENTURA',
                'email' => 'luboav31@gmail.com',
                'password' => '12345678',
                'role_slug' => 'discente',
                'lattes_url' => '',
                'observation' => '',
            ],
            [
                'name' => 'THIAGO RAMOS DOS SANTOS',
                'email' => 'thiagoramos.int@gmail.com',
                'password' => '12345678',
                'role_slug' => 'discente',
                'lattes_url' => '',
                'observation' => '',
            ],
            [
                'name' => 'RENATO VARELLA BUENO',
                'email' => 'renatovarellab@gmail.com',
                'password' => '12345678',
                'role_slug' => 'discente',
                'lattes_url' => '',
                'observation' => '',
            ],
        ];

        // Criar usuários administrativos
        foreach ($adminUsers as $userData) {
            $roleSlug = $userData['role_slug'];
            unset($userData['role_slug']);

            $user = User::create($userData);

            $role = Role::where('slug', $roleSlug)->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }
        }

        /*
        // Criar docentes com associação às linhas de pesquisa
        foreach ($docentes as $userData) {
            $roleSlug = $userData['role_slug'];
            $researchLineAlias = $userData['research_line_alias'];
            unset($userData['role_slug'], $userData['research_line_alias']);

            // Buscar a linha de pesquisa pelo alias
            $researchLine = ResearchLine::where('alias', $researchLineAlias)->first();
            if ($researchLine) {
                $userData['research_line_id'] = $researchLine->id;
            }

            $user = User::create($userData);

            $role = Role::where('slug', $roleSlug)->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }
        }

        // Criar discentes (sem linha de pesquisa específica)
        foreach ($discentes as $userData) {
            $roleSlug = $userData['role_slug'];
            unset($userData['role_slug']);

            $user = User::create($userData);

            $role = Role::where('slug', $roleSlug)->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }
        }
        */
    }
}
