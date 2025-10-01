<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            CourseSeeder::class,
            ResearchLineSeeder::class, // Movido para ANTES do UserSeeder
            UserSeeder::class,
            AgencySeeder::class,
            JournalSeeder::class,
            EventSeeder::class,
            AcademicBondSeeder::class,
            PublicationSeeder::class,
            EventParticipationSeeder::class,
        ]);
    }
}
