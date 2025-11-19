<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop foreign keys before renaming to avoid constraint name conflicts
        Schema::table('student_courses', function (Blueprint $table) {
            $table->dropForeign(['academic_bond_id']);
            $table->dropForeign(['course_id']);
        });

        // Rename current table to backup
        Schema::rename('student_courses', 'student_courses_backup');

        // Create new simplified table
        Schema::create('student_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_bond_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            // Unique constraint to prevent duplicate course enrollment
            $table->unique(['academic_bond_id', 'course_id']);

            // Indexes for performance
            $table->index(['academic_bond_id']);
            $table->index(['course_id']);
        });

        // Migrate data from backup to new table (only academic_bond_id and course_id)
        DB::statement('
            INSERT INTO student_courses (academic_bond_id, course_id, created_at, updated_at)
            SELECT academic_bond_id, course_id, created_at, updated_at
            FROM student_courses_backup
        ');

        // Drop backup table
        Schema::dropIfExists('student_courses_backup');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be easily reversed due to data loss
        // If rollback is needed, restore from backup or recreate original structure
        throw new \Exception('This migration cannot be reversed. Data from removed columns would be lost.');
    }
};
