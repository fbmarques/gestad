<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    protected $fillable = [
        'academic_bond_id',
        'sender_id',
        'recipient_id',
        'subject',
        'body',
        'priority',
        'is_read',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    public function academicBond(): BelongsTo
    {
        return $this->belongsTo(AcademicBond::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function reads(): HasMany
    {
        return $this->hasMany(MessageRead::class);
    }

    /**
     * Scope para mensagens de um vínculo acadêmico (conversa em grupo)
     */
    public function scopeForAcademicBond($query, int $academicBondId)
    {
        return $query->where('academic_bond_id', $academicBondId);
    }

    /**
     * Scope para mensagens entre dois usuários (conversa) - Legacy
     *
     * @deprecated Use scopeForAcademicBond para mensagens em grupo
     */
    public function scopeConversationBetween($query, int $userId1, int $userId2)
    {
        return $query->where(function ($q) use ($userId1, $userId2) {
            $q->where('sender_id', $userId1)->where('recipient_id', $userId2);
        })->orWhere(function ($q) use ($userId1, $userId2) {
            $q->where('sender_id', $userId2)->where('recipient_id', $userId1);
        });
    }

    /**
     * Scope para mensagens recebidas por um usuário
     */
    public function scopeReceivedBy($query, int $userId)
    {
        return $query->where('recipient_id', $userId);
    }

    /**
     * Scope para mensagens enviadas por um usuário
     */
    public function scopeSentBy($query, int $userId)
    {
        return $query->where('sender_id', $userId);
    }

    /**
     * Scope para mensagens não lidas
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Marcar mensagem como lida (legacy - mantido para compatibilidade)
     */
    public function markAsRead(): void
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    /**
     * Marcar mensagem como lida por um usuário específico
     */
    public function markAsReadBy(int $userId): void
    {
        $this->reads()->updateOrCreate(
            ['user_id' => $userId],
            ['read_at' => now()]
        );
    }

    /**
     * Verificar se mensagem foi lida por um usuário específico
     */
    public function isReadBy(int $userId): bool
    {
        return $this->reads()->where('user_id', $userId)->exists();
    }

    /**
     * Obter participantes do vínculo acadêmico (orientador, co-orientador, discente)
     */
    public function getParticipants(): array
    {
        if (! $this->academicBond) {
            return [];
        }

        $participants = [];

        if ($this->academicBond->student_id) {
            $participants[] = $this->academicBond->student_id;
        }

        if ($this->academicBond->advisor_id) {
            $participants[] = $this->academicBond->advisor_id;
        }

        if ($this->academicBond->co_advisor_id) {
            $participants[] = $this->academicBond->co_advisor_id;
        }

        return $participants;
    }
}
