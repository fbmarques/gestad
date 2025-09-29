<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Publication extends Model
{
    /** @use HasFactory<\Database\Factories\PublicationFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'academic_bond_id',
        'journal_id',
        'title',
        'authors',
        'submission_date',
        'approval_date',
        'publication_date',
        'status',
        'qualis_rating',
        'program_evaluation',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'authors' => 'array',
            'submission_date' => 'date',
            'approval_date' => 'date',
            'publication_date' => 'date',
        ];
    }

    public function academicBond(): BelongsTo
    {
        return $this->belongsTo(AcademicBond::class);
    }

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    /**
     * Get the status badge display text.
     */
    public function getStatusDisplayAttribute(): string
    {
        return match ($this->status) {
            'S' => 'Submetido',
            'A' => 'Aprovado',
            'P' => 'Publicado',
            'E' => 'Enviado',
            'D' => 'Deferido pelo colegiado',
            'I' => 'Indeferido pelo colegiado',
            default => 'Desconhecido',
        };
    }

    /**
     * Check if publication can be selected for PDF generation.
     */
    public function canBeSelectedForPdf(): bool
    {
        return $this->status === 'P'; // Only published articles
    }
}
