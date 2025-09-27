<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
        $docentes = [
            [
                'name' => 'Prof. Dr. Carlos Alberto Silva',
                'email' => 'carlos.silva@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'docente',
                'lattes_url' => 'http://lattes.cnpq.br/1234567890123456',
                'orcid' => '0000-0000-0000-0001',
                'observation' => 'Especialista em Gestão da Informação e Sistemas de Informação'
            ],
            [
                'name' => 'Profa. Dra. Maria Helena Costa',
                'email' => 'maria.costa@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'docente',
                'lattes_url' => 'http://lattes.cnpq.br/2345678901234567',
                'orcid' => '0000-0000-0000-0002',
                'observation' => 'Pesquisadora em Organização e Representação da Informação'
            ],
            [
                'name' => 'Prof. Dr. João Santos Oliveira',
                'email' => 'joao.oliveira@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'docente',
                'lattes_url' => 'http://lattes.cnpq.br/3456789012345678',
                'orcid' => '0000-0000-0000-0003',
                'observation' => 'Especialista em Biblioteconomia e Competência Informacional'
            ],
            [
                'name' => 'Profa. Dra. Ana Paula Ferreira',
                'email' => 'ana.ferreira@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'docente',
                'lattes_url' => 'http://lattes.cnpq.br/4567890123456789',
                'orcid' => '0000-0000-0000-0004',
                'observation' => 'Pesquisadora em Estudos Métricos da Informação'
            ],
            [
                'name' => 'Prof. Dr. Roberto Lima Pereira',
                'email' => 'roberto.pereira@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'docente',
                'lattes_url' => 'http://lattes.cnpq.br/5678901234567890',
                'orcid' => '0000-0000-0000-0005',
                'observation' => 'Especialista em Tecnologia da Informação e Arquivologia'
            ],
            [
                'name' => 'Profa. Dra. Luciana Barbosa',
                'email' => 'luciana.barbosa@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'docente',
                'lattes_url' => 'http://lattes.cnpq.br/6789012345678901',
                'orcid' => '0000-0000-0000-0006',
                'observation' => 'Pesquisadora em Mediação e Apropriação da Informação'
            ],
            [
                'name' => 'Prof. Dr. Fernando Rodrigues',
                'email' => 'fernando.rodrigues@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'docente',
                'lattes_url' => 'http://lattes.cnpq.br/7890123456789012',
                'orcid' => '0000-0000-0000-0007',
                'observation' => 'Especialista em Epistemologia da Ciência da Informação'
            ],
            [
                'name' => 'Profa. Dra. Patrícia Almeida',
                'email' => 'patricia.almeida@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'docente',
                'lattes_url' => 'http://lattes.cnpq.br/8901234567890123',
                'orcid' => '0000-0000-0000-0008',
                'observation' => 'Pesquisadora em Informação e Sociedade'
            ],
            [
                'name' => 'Prof. Dr. Marcos Vinícius Souza',
                'email' => 'marcos.souza@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'docente',
                'lattes_url' => 'http://lattes.cnpq.br/9012345678901234',
                'orcid' => '0000-0000-0000-0009',
                'observation' => 'Especialista em Recuperação e Visualização da Informação'
            ],
            [
                'name' => 'Profa. Dra. Silvia Regina Martins',
                'email' => 'silvia.martins@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'docente',
                'lattes_url' => 'http://lattes.cnpq.br/0123456789012345',
                'orcid' => '0000-0000-0000-0010',
                'observation' => 'Pesquisadora em Gestão do Conhecimento e Inovação'
            ],
        ];

        // 20 Discentes (estudantes de pós-graduação)
        $discentes = [
            [
                'name' => 'Amanda Silva Santos',
                'email' => 'amanda.santos@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'lattes_url' => 'http://lattes.cnpq.br/1111111111111111',
                'observation' => 'Mestranda em Ciência da Informação - 1º ano'
            ],
            [
                'name' => 'Bruno Costa Lima',
                'email' => 'bruno.lima@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'lattes_url' => 'http://lattes.cnpq.br/2222222222222222',
                'observation' => 'Doutorando em Ciência da Informação - 2º ano'
            ],
            [
                'name' => 'Carla Ferreira Oliveira',
                'email' => 'carla.oliveira@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'lattes_url' => 'http://lattes.cnpq.br/3333333333333333',
                'observation' => 'Mestranda em Ciência da Informação - 2º ano'
            ],
            [
                'name' => 'Daniel Rodrigues Pereira',
                'email' => 'daniel.pereira@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'observation' => 'Mestrando em Ciência da Informação - 1º ano'
            ],
            [
                'name' => 'Eduarda Almeida Barbosa',
                'email' => 'eduarda.barbosa@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'lattes_url' => 'http://lattes.cnpq.br/4444444444444444',
                'observation' => 'Doutoranda em Ciência da Informação - 3º ano'
            ],
            [
                'name' => 'Felipe Souza Martins',
                'email' => 'felipe.martins@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'observation' => 'Mestrando em Ciência da Informação - 1º ano'
            ],
            [
                'name' => 'Gabriela Lima Costa',
                'email' => 'gabriela.costa@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'lattes_url' => 'http://lattes.cnpq.br/5555555555555555',
                'observation' => 'Doutoranda em Ciência da Informação - 1º ano'
            ],
            [
                'name' => 'Henrique Santos Silva',
                'email' => 'henrique.silva@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'observation' => 'Mestrando em Ciência da Informação - 2º ano'
            ],
            [
                'name' => 'Isabela Oliveira Ferreira',
                'email' => 'isabela.ferreira@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'lattes_url' => 'http://lattes.cnpq.br/6666666666666666',
                'observation' => 'Mestranda em Ciência da Informação - 1º ano'
            ],
            [
                'name' => 'João Pedro Barbosa',
                'email' => 'joao.barbosa@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'observation' => 'Doutorando em Ciência da Informação - 4º ano'
            ],
            [
                'name' => 'Larissa Pereira Santos',
                'email' => 'larissa.santos@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'lattes_url' => 'http://lattes.cnpq.br/7777777777777777',
                'observation' => 'Mestranda em Ciência da Informação - 2º ano'
            ],
            [
                'name' => 'Matheus Costa Rodrigues',
                'email' => 'matheus.rodrigues@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'observation' => 'Mestrando em Ciência da Informação - 1º ano'
            ],
            [
                'name' => 'Natália Silva Almeida',
                'email' => 'natalia.almeida@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'lattes_url' => 'http://lattes.cnpq.br/8888888888888888',
                'observation' => 'Doutoranda em Ciência da Informação - 2º ano'
            ],
            [
                'name' => 'Otávio Lima Souza',
                'email' => 'otavio.souza@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'observation' => 'Mestrando em Ciência da Informação - 2º ano'
            ],
            [
                'name' => 'Priscila Martins Oliveira',
                'email' => 'priscila.oliveira@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'lattes_url' => 'http://lattes.cnpq.br/9999999999999999',
                'observation' => 'Mestranda em Ciência da Informação - 1º ano'
            ],
            [
                'name' => 'Rafael Ferreira Lima',
                'email' => 'rafael.lima@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'observation' => 'Doutorando em Ciência da Informação - 3º ano'
            ],
            [
                'name' => 'Sofia Barbosa Costa',
                'email' => 'sofia.costa@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'lattes_url' => 'http://lattes.cnpq.br/1010101010101010',
                'observation' => 'Mestranda em Ciência da Informação - 1º ano'
            ],
            [
                'name' => 'Thiago Santos Pereira',
                'email' => 'thiago.pereira@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'observation' => 'Mestrando em Ciência da Informação - 2º ano'
            ],
            [
                'name' => 'Vanessa Almeida Silva',
                'email' => 'vanessa.silva@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'lattes_url' => 'http://lattes.cnpq.br/1212121212121212',
                'observation' => 'Doutoranda em Ciência da Informação - 1º ano'
            ],
            [
                'name' => 'Wagner Oliveira Rodrigues',
                'email' => 'wagner.rodrigues@ppgci.edu.br',
                'password' => '123321',
                'role_slug' => 'discente',
                'observation' => 'Mestrando em Ciência da Informação - 1º ano'
            ],
        ];

        // Criar todos os usuários
        $allUsers = array_merge($adminUsers, $docentes, $discentes);

        foreach ($allUsers as $userData) {
            $roleSlug = $userData['role_slug'];
            unset($userData['role_slug']);

            $user = User::create($userData);

            $role = Role::where('slug', $roleSlug)->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }
        }
    }
}
