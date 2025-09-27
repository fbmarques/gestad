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
            // Reverter as mudanças apenas se as colunas existirem
            if (Schema::hasColumn('events', 'nome')) {
                $table->renameColumn('nome', 'title');
            }

            if (Schema::hasColumn('events', 'alias')) {
                $table->dropColumn('alias');
            }

            if (Schema::hasColumn('events', 'tipo')) {
                $table->renameColumn('tipo', 'type');
            }

            if (Schema::hasColumn('events', 'natureza')) {
                $table->renameColumn('natureza', 'nature');
            }

            // Restaurar campos removidos apenas se não existirem
            if (!Schema::hasColumn('events', 'description')) {
                $table->text('description')->nullable();
            }

            if (!Schema::hasColumn('events', 'start_date')) {
                $table->date('start_date');
            }

            if (!Schema::hasColumn('events', 'end_date')) {
                $table->date('end_date')->nullable();
            }

            if (!Schema::hasColumn('events', 'location')) {
                $table->string('location')->nullable();
            }
        });
    }
};
