<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventParticipation extends Model
{
    /** @use HasFactory<\Database\Factories\EventParticipationFactory> */
    use HasFactory;

    protected $fillable = [
        'academic_bond_id',
        'event_id',
        'title',
        'name',
        'location',
        'year',
        'type',
    ];

    public function casts(): array
    {
        return [
            'year' => 'integer',
        ];
    }

    public const TYPES = [
        'Conferência',
        'Simpósio',
        'Workshop',
        'Congresso',
    ];

    public function academicBond(): BelongsTo
    {
        return $this->belongsTo(AcademicBond::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
