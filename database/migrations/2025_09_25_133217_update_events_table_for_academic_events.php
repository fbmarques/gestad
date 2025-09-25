<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

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
        Schema::table('events', function (Blueprint $table) {
            // Reverter as mudanças
            $table->renameColumn('nome', 'title');
            $table->dropColumn('alias');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('natureza', 'nature');

            // Restaurar campos removidos
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('location')->nullable();
        });
    }
};
