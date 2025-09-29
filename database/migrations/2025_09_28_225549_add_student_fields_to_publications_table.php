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
        Schema::table('publications', function (Blueprint $table) {
            // Adicionar campos necessários para o módulo discente
            $table->date('submission_date')->after('title');
            $table->date('approval_date')->nullable()->after('submission_date');
            $table->enum('status', ['S', 'A', 'P', 'E', 'D', 'I'])
                ->default('S')
                ->after('approval_date')
                ->comment('S=submetido, A=aprovado, P=publicado, E=enviado, D=deferido pelo colegiado, I=indeferido pelo colegiado');

            // Tornar publication_date nullable
            $table->date('publication_date')->nullable()->change();

            // Adicionar índice para status
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('publications', function (Blueprint $table) {
            // Remover índice
            $table->dropIndex(['status']);

            // Remover campos adicionados
            $table->dropColumn(['submission_date', 'approval_date', 'status']);

            // Reverter publication_date para não nullable
            $table->date('publication_date')->change();
        });
    }
};
