<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('academic_bonds', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['agency_id']);

            // Make the column nullable
            $table->foreignId('agency_id')->nullable()->change();

            // Add foreign key constraint back (nullable)
            $table->foreign('agency_id')->references('id')->on('agencies')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('academic_bonds', function (Blueprint $table) {
            // Drop the nullable foreign key
            $table->dropForeign(['agency_id']);
        });

        // First, assign a default agency to any null values before making NOT NULL
        $defaultAgency = DB::table('agencies')->first();
        if ($defaultAgency) {
            DB::table('academic_bonds')
                ->whereNull('agency_id')
                ->update(['agency_id' => $defaultAgency->id]);
        }

        Schema::table('academic_bonds', function (Blueprint $table) {
            // Make the column not nullable again
            $table->foreignId('agency_id')->nullable(false)->change();

            // Add foreign key constraint back (not nullable)
            $table->foreign('agency_id')->references('id')->on('agencies')->onDelete('cascade');
        });
    }
};
