<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    /** @use HasFactory<\Database\Factories\EventFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nome',
        'alias',
        'tipo',
        'natureza',
    ];

    public function casts(): array
    {
        return [
            'deleted_at' => 'datetime',
        ];
    }

    public const TIPOS = [
        'Conferência',
        'Simpósio',
        'Workshop',
        'Congresso',
    ];

    public const NATUREZAS = [
        'Nacional',
        'Internacional',
    ];
}
