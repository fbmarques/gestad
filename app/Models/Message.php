<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    protected $fillable = [
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
     * Scope para mensagens entre dois usuários (conversa)
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
     * Marcar mensagem como lida
     */
    public function markAsRead(): void
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }
}
