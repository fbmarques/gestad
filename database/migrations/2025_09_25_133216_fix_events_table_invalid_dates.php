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
        // Fix any invalid dates in the events table before the problematic migration runs
        DB::statement("UPDATE events SET start_date = NULL WHERE start_date = '0000-00-00' OR start_date = ''");
        DB::statement("UPDATE events SET end_date = NULL WHERE end_date = '0000-00-00' OR end_date = ''");

        // Also fix any other potential invalid date formats
        DB::statement("UPDATE events SET start_date = NULL WHERE start_date IS NOT NULL AND start_date < '1900-01-01'");
        DB::statement("UPDATE events SET end_date = NULL WHERE end_date IS NOT NULL AND end_date < '1900-01-01'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse this fix - we don't want invalid dates back
    }
};
