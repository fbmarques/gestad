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
        Schema::table('academic_bonds', function (Blueprint $table) {
            $table->boolean('problem_defined')->default(false);
            $table->text('problem_text')->nullable();
            $table->boolean('question_defined')->default(false);
            $table->text('question_text')->nullable();
            $table->boolean('objectives_defined')->default(false);
            $table->text('objectives_text')->nullable();
            $table->boolean('methodology_defined')->default(false);
            $table->text('methodology_text')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('academic_bonds', function (Blueprint $table) {
            $table->dropColumn([
                'problem_defined',
                'problem_text',
                'question_defined',
                'question_text',
                'objectives_defined',
                'objectives_text',
                'methodology_defined',
                'methodology_text',
            ]);
        });
    }
};
