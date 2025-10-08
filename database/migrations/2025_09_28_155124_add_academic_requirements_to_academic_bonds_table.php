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
            $table->enum('qualification_status', ['Not Scheduled', 'Scheduled', 'Completed'])->default('Not Scheduled');
            $table->date('qualification_date')->nullable();
            $table->date('qualification_completion_date')->nullable();
            $table->enum('defense_status', ['Not Scheduled', 'Scheduled', 'Completed'])->default('Not Scheduled');
            $table->date('defense_date')->nullable();
            $table->date('defense_completion_date')->nullable();
            $table->boolean('work_completed')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('academic_bonds', function (Blueprint $table) {
            $table->dropColumn([
                'qualification_status',
                'qualification_date',
                'qualification_completion_date',
                'defense_status',
                'defense_date',
                'defense_completion_date',
                'work_completed',
            ]);
        });
    }
};
