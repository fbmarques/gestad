<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_lines', function (Blueprint $table) {
            if (!Schema::hasColumn('research_lines', 'alias')) {
                $table->string('alias')->nullable()->after('name');
            }
        });

        // Adjust coordinator_id to be nullable and nullOnDelete
        Schema::table('research_lines', function (Blueprint $table) {
            // For portability across drivers, attempt to drop and recreate FK
            try {
                $table->dropForeign(['coordinator_id']);
            } catch (\Throwable $e) {
                // ignore if driver does not support
            }

            try {
                $table->foreignId('coordinator_id')->nullable()->change();
            } catch (\Throwable $e) {
                // Some drivers (e.g., SQLite) may not support change(); fall back by leaving column as-is if already nullable
            }

            try {
                $table->foreign('coordinator_id')->references('id')->on('users')->nullOnDelete();
            } catch (\Throwable $e) {
                // ignore if already exists or driver limitations
            }
        });
    }

    public function down(): void
    {
        Schema::table('research_lines', function (Blueprint $table) {
            if (Schema::hasColumn('research_lines', 'alias')) {
                $table->dropColumn('alias');
            }
        });

        Schema::table('research_lines', function (Blueprint $table) {
            try {
                $table->dropForeign(['coordinator_id']);
            } catch (\Throwable $e) {
                // ignore
            }

            try {
                $table->foreignId('coordinator_id')->nullable(false)->change();
            } catch (\Throwable $e) {
                // ignore
            }

            try {
                $table->foreign('coordinator_id')->references('id')->on('users')->onDelete('cascade');
            } catch (\Throwable $e) {
                // ignore
            }
        });
    }
};


