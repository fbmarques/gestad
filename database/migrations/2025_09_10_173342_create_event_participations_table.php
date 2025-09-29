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
        Schema::create('event_participations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_bond_id')->constrained('academic_bonds')->onDelete('cascade');
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->string('title'); // título do trabalho apresentado
            $table->string('name'); // nome do evento
            $table->string('location'); // local do evento
            $table->integer('year'); // ano de participação
            $table->string('type'); // tipo: Conferência, Simpósio, Workshop, Congresso
            $table->timestamps();

            $table->index(['academic_bond_id']);
            $table->index(['event_id']);
            $table->index(['year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_participations');
    }
};
