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
        Schema::create('publications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_bond_id')->constrained('academic_bonds')->onDelete('cascade');
            $table->foreignId('journal_id')->constrained('journals')->onDelete('cascade');
            $table->string('title');
            $table->text('abstract')->nullable();
            $table->json('authors'); // array de nomes dos autores
            $table->string('doi')->nullable();
            $table->integer('volume')->nullable();
            $table->integer('number')->nullable();
            $table->integer('pages_start')->nullable();
            $table->integer('pages_end')->nullable();
            $table->date('publication_date');
            $table->enum('qualis_rating', ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C']);
            $table->enum('program_evaluation', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('evaluation_notes')->nullable();
            $table->timestamp('evaluated_at')->nullable();
            $table->timestamps();

            $table->index(['academic_bond_id']);
            $table->index(['journal_id']);
            $table->index(['program_evaluation']);
            $table->index(['qualis_rating']);
            $table->index(['publication_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publications');
    }
};
