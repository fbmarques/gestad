<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentCourse extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_bond_id',
        'course_id',
        'docente_id',
    ];

    protected function casts(): array
    {
        return [
            'academic_bond_id' => 'integer',
            'course_id' => 'integer',
            'docente_id' => 'integer',
        ];
    }

    public function academicBond(): BelongsTo
    {
        return $this->belongsTo(AcademicBond::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_id');
    }
}
