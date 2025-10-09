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
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('academic_bond_id')->nullable()->after('id')->constrained('academic_bonds')->onDelete('cascade');
            $table->index('academic_bond_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['academic_bond_id']);
            $table->dropIndex(['academic_bond_id']);
            $table->dropColumn('academic_bond_id');
        });
    }
};
