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
        $users = [
            [
                'name' => 'Administrador',
                'email' => 'admin@minhapesquisa.com.br',
                'password' => '123321',
                'role_slug' => 'admin',
            ],
            [
                'name' => 'Docente Teste',
                'email' => 'docente@minhapesquisa.com.br',
                'password' => '123321',
                'role_slug' => 'docente',
            ],
            [
                'name' => 'Discente Teste',
                'email' => 'discente@minhapesquisa.com.br',
                'password' => '123321',
                'role_slug' => 'discente',
            ],
        ];

        foreach ($users as $userData) {
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
