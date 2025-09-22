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
        Schema::create('student_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_bond_id')->constrained('academic_bonds')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('semester', 10); // formato: 2024.1 ou 2024.2
            $table->decimal('grade', 5, 2)->nullable();
            $table->enum('status', ['enrolled', 'completed', 'failed', 'dropped']);
            $table->date('enrollment_date');
            $table->date('completion_date')->nullable();
            $table->timestamps();

            $table->unique(['academic_bond_id', 'course_id', 'semester']);
            $table->index(['academic_bond_id', 'status']);
            $table->index(['course_id', 'semester']);
            $table->index(['semester']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_courses');
    }
};
