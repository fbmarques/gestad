<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_lines', function (Blueprint $table) {
            if (! Schema::hasColumn('research_lines', 'alias')) {
                $table->string('alias')->nullable()->after('name');
            }
        });

        // coordinator_id is already nullable from the original migration
        // Foreign key will be added by dedicated migration later
    }

    public function down(): void
    {
        Schema::table('research_lines', function (Blueprint $table) {
            if (Schema::hasColumn('research_lines', 'alias')) {
                $table->dropColumn('alias');
            }
        });

        // Foreign key changes will be handled by dedicated foreign key migration rollback
    }
};
