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
            $table->unsignedBigInteger('co_advisor_id')->nullable()->after('advisor_id');
            $table->foreign('co_advisor_id')->references('id')->on('users')->onDelete('set null');
            $table->index('co_advisor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('academic_bonds', function (Blueprint $table) {
            $table->dropForeign(['co_advisor_id']);
            $table->dropIndex(['co_advisor_id']);
            $table->dropColumn('co_advisor_id');
        });
    }
};
