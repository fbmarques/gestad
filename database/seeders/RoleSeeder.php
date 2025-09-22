<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Administrador',
                'slug' => 'admin',
                'description' => 'Acesso total ao sistema',
            ],
            [
                'name' => 'Docente',
                'slug' => 'docente',
                'description' => 'Professor ou pesquisador',
            ],
            [
                'name' => 'Discente',
                'slug' => 'discente',
                'description' => 'Estudante de graduação ou pós-graduação',
            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
