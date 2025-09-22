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
            $table->enum('participation_type', ['participant', 'speaker', 'organizer', 'coordinator']);
            $table->string('title')->nullable(); // título da apresentação/palestra
            $table->text('description')->nullable();
            $table->date('participation_date');
            $table->integer('hours')->nullable(); // horas de participação
            $table->boolean('certificate_issued')->default(false);
            $table->string('certificate_url')->nullable();
            $table->timestamps();

            $table->index(['academic_bond_id']);
            $table->index(['event_id']);
            $table->index(['participation_type']);
            $table->index(['participation_date']);
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
