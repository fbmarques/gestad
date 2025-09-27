<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Renomear e ajustar campos para corresponder ao frontend
            $table->renameColumn('title', 'nome');
            $table->string('alias')->after('nome'); // Sigla/alias do evento
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('nature', 'natureza');

            // Remover campos não utilizados pelo frontend
            $table->dropColumn(['description', 'start_date', 'end_date', 'location']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // For production safety, we'll backup important data and recreate the table
        // This approach avoids complex column manipulations that can fail

        // First, backup existing events data (only valid records)
        $existingEvents = DB::table('events')
            ->whereNotNull('nome')
            ->where('nome', '!=', '')
            ->whereNotNull('tipo')
            ->where('tipo', '!=', '')
            ->whereNotNull('natureza')
            ->where('natureza', '!=', '')
            ->get();

        // Drop and recreate the table with original structure
        Schema::dropIfExists('events');

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('location')->nullable();
            $table->string('type');
            $table->string('nature');
            $table->softDeletes();
            $table->timestamps();
        });

        // Restore data with proper field mapping and valid dates
        foreach ($existingEvents as $event) {
            DB::table('events')->insert([
                'id' => $event->id,
                'title' => $event->nome,
                'description' => null,
                'start_date' => '2024-01-01', // Default valid date
                'end_date' => null,
                'location' => null,
                'type' => $event->tipo,
                'nature' => $event->natureza,
                'deleted_at' => $event->deleted_at,
                'created_at' => $event->created_at,
                'updated_at' => $event->updated_at,
            ]);
        }
    }
};
