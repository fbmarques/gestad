<?php

namespace Database\Seeders;

use App\Models\AcademicBond;
use App\Models\Agency;
use App\Models\ResearchLine;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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

        // Create academic bonds for each student
        foreach ($discentes as $index => $discente) {
            // Distribute advisors evenly among students
            $advisor = $docentes->get($index % $docentes->count());

            // Randomly assign research line
            $researchLine = $researchLines->random();

            // Define level based on index (mix of master and doctorate)
            $levels = ['master', 'doctorate'];
            $level = $levels[$index % 2];

            AcademicBond::create([
                'student_id' => $discente->id,
                'advisor_id' => $advisor->id,
                'agency_id' => null, // Sempre null conforme solicitado
                'research_line_id' => $researchLine->id,
                'level' => $level,
                'status' => 'active', // Sempre active conforme solicitado
                'start_date' => null, // Sempre null conforme solicitado
                'end_date' => null, // Sempre null conforme solicitado
                'title' => null, // Sempre null conforme solicitado
                'description' => null, // Sempre null conforme solicitado
            ]);
        }

        $this->command->info('Vínculos acadêmicos criados com sucesso!');
    }
}
