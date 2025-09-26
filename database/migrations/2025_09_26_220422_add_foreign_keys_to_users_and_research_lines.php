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
        // Add foreign key from users to research_lines
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('research_line_id')->references('id')->on('research_lines')->onDelete('set null');
        });

        // Add foreign key from research_lines to users (coordinator)
        Schema::table('research_lines', function (Blueprint $table) {
            $table->foreign('coordinator_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove foreign keys in reverse order
        Schema::table('research_lines', function (Blueprint $table) {
            $table->dropForeign(['coordinator_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['research_line_id']);
        });
    }
};
