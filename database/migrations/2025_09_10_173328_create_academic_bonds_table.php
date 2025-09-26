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
        Schema::create('academic_bonds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('advisor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('agency_id')->constrained('agencies')->onDelete('cascade');
            $table->foreignId('research_line_id')->constrained('research_lines')->onDelete('cascade');
            $table->enum('level', ['graduation', 'master', 'doctorate', 'post-doctorate']);
            $table->enum('status', ['active', 'inactive', 'completed', 'suspended']);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
            $table->index(['advisor_id', 'status']);
            $table->index(['agency_id']);
            $table->index(['research_line_id']);
            $table->index(['level']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_bonds');
    }
};
