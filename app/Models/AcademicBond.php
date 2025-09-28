<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicBond extends Model
{
    /** @use HasFactory<\Database\Factories\AcademicBondFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'student_id',
        'advisor_id',
        'co_advisor_id',
        'agency_id',
        'research_line_id',
        'level',
        'status',
        'start_date',
        'end_date',
        'title',
        'description',
        'problem_defined',
        'problem_text',
        'question_defined',
        'question_text',
        'objectives_defined',
        'objectives_text',
        'methodology_defined',
        'methodology_text',
        'qualification_status',
        'qualification_date',
        'qualification_completion_date',
        'defense_status',
        'defense_date',
        'defense_completion_date',
        'work_completed',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'problem_defined' => 'boolean',
            'question_defined' => 'boolean',
            'objectives_defined' => 'boolean',
            'methodology_defined' => 'boolean',
            'qualification_date' => 'date',
            'qualification_completion_date' => 'date',
            'defense_date' => 'date',
            'defense_completion_date' => 'date',
            'work_completed' => 'boolean',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function advisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'advisor_id');
    }

    public function coAdvisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'co_advisor_id');
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function researchLine(): BelongsTo
    {
        return $this->belongsTo(ResearchLine::class);
    }
}
