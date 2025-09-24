<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            [
                'code' => 'CC001',
                'name' => 'Algoritmos e Estruturas de Dados',
                'description' => 'Estudo de algoritmos fundamentais e estruturas de dados utilizadas na programação.',
                'credits' => 4,
            ],
            [
                'code' => 'CC002',
                'name' => 'Programação Orientada a Objetos',
                'description' => 'Conceitos e práticas da programação orientada a objetos.',
                'credits' => 4,
            ],
            [
                'code' => 'CC003',
                'name' => 'Banco de Dados',
                'description' => 'Modelagem, implementação e administração de sistemas de banco de dados.',
                'credits' => 4,
            ],
            [
                'code' => 'CC004',
                'name' => 'Engenharia de Software',
                'description' => 'Metodologias e práticas para o desenvolvimento de software.',
                'credits' => 4,
            ],
            [
                'code' => 'CC005',
                'name' => 'Redes de Computadores',
                'description' => 'Fundamentos de redes de computadores e protocolos de comunicação.',
                'credits' => 4,
            ],
            [
                'code' => 'CC006',
                'name' => 'Sistemas Operacionais',
                'description' => 'Conceitos e estruturas de sistemas operacionais modernos.',
                'credits' => 4,
            ],
            [
                'code' => 'CC007',
                'name' => 'Inteligência Artificial',
                'description' => 'Introdução aos conceitos e técnicas de inteligência artificial.',
                'credits' => 4,
            ],
            [
                'code' => 'CC008',
                'name' => 'Segurança da Informação',
                'description' => 'Princípios e práticas de segurança em sistemas computacionais.',
                'credits' => 4,
            ],
            [
                'code' => 'MAT101',
                'name' => 'Cálculo Diferencial e Integral I',
                'description' => 'Fundamentos do cálculo diferencial e integral.',
                'credits' => 6,
            ],
            [
                'code' => 'MAT102',
                'name' => 'Álgebra Linear',
                'description' => 'Estudo de vetores, matrizes e transformações lineares.',
                'credits' => 4,
            ],
            [
                'code' => 'FIS101',
                'name' => 'Física Geral I',
                'description' => 'Mecânica clássica e suas aplicações.',
                'credits' => 5,
            ],
            [
                'code' => 'EST101',
                'name' => 'Estatística e Probabilidade',
                'description' => 'Conceitos fundamentais de estatística e teoria das probabilidades.',
                'credits' => 4,
            ],
        ];

        foreach ($courses as $course) {
            Course::create($course);
        }
    }
}