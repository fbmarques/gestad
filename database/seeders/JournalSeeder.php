<?php

namespace Database\Seeders;

use App\Models\Journal;
use Illuminate\Database\Seeder;

class JournalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Delete all records to avoid duplicates
        Journal::query()->delete();

        $csvFile = database_path('seeders/periodicos_corrigido.csv');

        if (! file_exists($csvFile)) {
            $this->command->warn('CSV file not found: '.$csvFile);

            return;
        }

        $handle = fopen($csvFile, 'r');

        if ($handle === false) {
            $this->command->error('Could not open CSV file');

            return;
        }

        // Skip header row
        fgetcsv($handle, 1000, ';');

        $journals = [];
        $count = 0;

        while (($row = fgetcsv($handle, 1000, ';')) !== false) {
            // Skip empty rows
            if (empty($row[0]) || trim($row[0]) === '') {
                continue;
            }

            $name = trim($row[0]);
            $institution = trim($row[1] ?? '');
            $qualis = trim($row[2] ?? '');
            $issn = trim($row[3] ?? '');

            // Determine type based on institution or journal name
            $type = $this->determineType($name, $institution);

            $journals[] = [
                'name' => $name,
                'institution' => $institution ?: null,
                'qualis' => $qualis ?: null,
                'issn' => $issn ?: null,
                'type' => $type,
                'description' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $count++;

            // Insert in batches of 100
            if ($count % 100 === 0) {
                Journal::upsert($journals, ['issn'], ['name', 'institution', 'qualis', 'type', 'description', 'updated_at']);
                $journals = [];
                $this->command->info("Processed {$count} journals...");
            }
        }

        // Insert remaining journals
        if (! empty($journals)) {
            Journal::upsert($journals, ['issn'], ['name', 'institution', 'qualis', 'type', 'description', 'updated_at']);
        }

        fclose($handle);

        $this->command->info("Successfully imported {$count} journals from CSV");
    }

    private function determineType(string $name, string $institution): string
    {
        $internationalIndicators = [
            'International', 'IEEE', 'ACM', 'Springer', 'Elsevier', 'MIT Press',
            'Academic Press', 'Pergamon', 'IOS Press', 'MDPI', 'Intellect',
            'Emerald', 'Taylor & Francis', 'IGI Global', 'University of Pittsburgh',
            'Pensoft Publishers', 'Journal', 'International Journal',
        ];

        $nameUpper = strtoupper($name);
        $institutionUpper = strtoupper($institution);

        foreach ($internationalIndicators as $indicator) {
            if (strpos($nameUpper, strtoupper($indicator)) !== false ||
                strpos($institutionUpper, strtoupper($indicator)) !== false) {
                return 'international';
            }
        }

        return 'national';
    }
}
