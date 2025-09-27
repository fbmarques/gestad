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
        // This migration ensures the events table is in the expected state
        // before the problematic migration tries to rollback

        // If we have old column names, rename them to new ones
        if (Schema::hasColumn('events', 'title') && !Schema::hasColumn('events', 'nome')) {
            Schema::table('events', function (Blueprint $table) {
                $table->renameColumn('title', 'nome');
            });
        }

        if (Schema::hasColumn('events', 'type') && !Schema::hasColumn('events', 'tipo')) {
            Schema::table('events', function (Blueprint $table) {
                $table->renameColumn('type', 'tipo');
            });
        }

        if (Schema::hasColumn('events', 'nature') && !Schema::hasColumn('events', 'natureza')) {
            Schema::table('events', function (Blueprint $table) {
                $table->renameColumn('nature', 'natureza');
            });
        }

        // Add alias column if it doesn't exist
        if (!Schema::hasColumn('events', 'alias')) {
            Schema::table('events', function (Blueprint $table) {
                $table->string('alias')->after('nome')->nullable();
            });
        }

        // Remove old columns if they exist
        $columnsToRemove = ['description', 'start_date', 'end_date', 'location'];
        foreach ($columnsToRemove as $column) {
            if (Schema::hasColumn('events', $column)) {
                Schema::table('events', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse this - we want the table in the correct state
    }
};
