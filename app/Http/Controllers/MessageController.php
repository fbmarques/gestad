<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendMessageRequest;
use App\Models\AcademicBond;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Get list of students for a teacher (docente).
     * Returns students with their latest message and unread count.
     */
    public function getStudentsForTeacher(Request $request): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->isDocente()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        // Get academic bonds where user is advisor or co-advisor
        $bonds = AcademicBond::where('advisor_id', $user->id)
            ->orWhere('co_advisor_id', $user->id)
            ->with(['student'])
            ->get()
            ->map(function ($bond) use ($user) {
                // Get latest message for this academic bond
                $latestMessage = Message::forAcademicBond($bond->id)
                    ->latest()
                    ->first();

                // Count unread messages for current user in this bond
                $unreadCount = Message::forAcademicBond($bond->id)
                    ->whereDoesntHave('reads', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->where('sender_id', '!=', $user->id)
                    ->count();

                return [
                    'id' => (string) $bond->student->id,
                    'bondId' => (string) $bond->id,
                    'nome' => $bond->student->name,
                    'tipo' => $bond->level ?? 'mestrado',
                    'ultimaMensagem' => $latestMessage?->body,
                    'horaUltimaMensagem' => $latestMessage?->created_at->toISOString(),
                    'mensagensNaoLidas' => $unreadCount,
                ];
            });

        return response()->json($bonds);
    }

    /**
     * Get conversation for an academic bond (group conversation).
     * All participants (student, advisor, co-advisor) see all messages.
     */
    public function getConversation(Request $request, int $userId): JsonResponse
    {
        $currentUser = auth()->user();

        if (! $currentUser) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        $otherUser = User::find($userId);

        if (! $otherUser) {
            return response()->json(['error' => 'Usuário não encontrado.'], 404);
        }

        // Find the academic bond that connects these users
        $bond = AcademicBond::where(function ($query) use ($currentUser, $otherUser) {
            $query->where('student_id', $currentUser->id)
                ->where(function ($q) use ($otherUser) {
                    $q->where('advisor_id', $otherUser->id)
                        ->orWhere('co_advisor_id', $otherUser->id);
                });
        })->orWhere(function ($query) use ($currentUser, $otherUser) {
            $query->where('student_id', $otherUser->id)
                ->where(function ($q) use ($currentUser) {
                    $q->where('advisor_id', $currentUser->id)
                        ->orWhere('co_advisor_id', $currentUser->id);
                });
        })->with(['advisor', 'coAdvisor', 'student'])
            ->first();

        if (! $bond) {
            return response()->json(['error' => 'Você não tem permissão para conversar com este usuário.'], 403);
        }

        // Get all messages for this academic bond
        $messages = Message::forAcademicBond($bond->id)
            ->with(['sender', 'reads.user'])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) use ($currentUser, $bond) {
                $senderType = 'user';
                if ($message->sender_id !== $currentUser->id) {
                    if ($message->sender_id === $bond->student_id) {
                        $senderType = 'student';
                    } elseif ($message->sender_id === $bond->advisor_id) {
                        $senderType = 'advisor';
                    } elseif ($message->sender_id === $bond->co_advisor_id) {
                        $senderType = 'co-advisor';
                    }
                }

                // Build detailed read information
                $readDetails = $message->reads->map(function ($read) {
                    return [
                        'user_id' => $read->user_id,
                        'user_name' => $read->user->name,
                        'read_at' => $read->read_at->toISOString(),
                    ];
                })->values()->toArray();

                return [
                    'id' => (string) $message->id,
                    'text' => $message->body,
                    'sender' => $message->sender_id === $currentUser->id ? 'user' : $senderType,
                    'senderName' => $message->sender->name,
                    'senderId' => $message->sender_id,
                    'timestamp' => $message->created_at->toISOString(),
                    'isReadByUser' => $message->isReadBy($currentUser->id),
                    'readBy' => $message->reads->pluck('user_id')->toArray(),
                    'readDetails' => $readDetails,
                ];
            });

        // Mark unread messages as read by current user
        Message::forAcademicBond($bond->id)
            ->whereDoesntHave('reads', function ($query) use ($currentUser) {
                $query->where('user_id', $currentUser->id);
            })
            ->where('sender_id', '!=', $currentUser->id)
            ->get()
            ->each(function ($message) use ($currentUser) {
                $message->markAsReadBy($currentUser->id);
            });

        return response()->json($messages);
    }

    /**
     * Send a message to academic bond group.
     */
    public function sendMessage(SendMessageRequest $request): JsonResponse
    {
        $currentUser = auth()->user();

        if (! $currentUser) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        $recipientId = $request->validated()['recipient_id'];
        $recipient = User::find($recipientId);

        if (! $recipient) {
            return response()->json(['error' => 'Destinatário não encontrado.'], 404);
        }

        // Find academic bond
        $bond = AcademicBond::where(function ($query) use ($currentUser, $recipientId) {
            $query->where('student_id', $currentUser->id)
                ->where(function ($q) use ($recipientId) {
                    $q->where('advisor_id', $recipientId)
                        ->orWhere('co_advisor_id', $recipientId);
                });
        })->orWhere(function ($query) use ($currentUser, $recipientId) {
            $query->where('student_id', $recipientId)
                ->where(function ($q) use ($currentUser) {
                    $q->where('advisor_id', $currentUser->id)
                        ->orWhere('co_advisor_id', $currentUser->id);
                });
        })->first();

        if (! $bond) {
            return response()->json(['error' => 'Você não tem permissão para enviar mensagens para este usuário.'], 403);
        }

        // Create message for academic bond (group message)
        $message = Message::create([
            'academic_bond_id' => $bond->id,
            'sender_id' => $currentUser->id,
            'recipient_id' => $recipientId,
            'subject' => $request->validated()['subject'] ?? 'Mensagem',
            'body' => $request->validated()['body'],
            'priority' => $request->validated()['priority'] ?? 'normal',
        ]);

        // Mark as read by sender immediately
        $message->markAsReadBy($currentUser->id);

        // Refresh to get the read relationship
        $message->load('reads.user');

        $readDetails = $message->reads->map(function ($read) {
            return [
                'user_id' => $read->user_id,
                'user_name' => $read->user->name,
                'read_at' => $read->read_at->toISOString(),
            ];
        })->values()->toArray();

        return response()->json([
            'id' => (string) $message->id,
            'text' => $message->body,
            'sender' => 'user',
            'senderName' => $currentUser->name,
            'senderId' => $currentUser->id,
            'timestamp' => $message->created_at->toISOString(),
            'isReadByUser' => true,
            'readBy' => [$currentUser->id],
            'readDetails' => $readDetails,
        ], 201);
    }

    /**
     * Get advisor and co-advisor for student.
     */
    public function getAdvisorsForStudent(Request $request): JsonResponse
    {
        $user = auth()->user();

        if (! $user || ! $user->isDiscente()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $bond = AcademicBond::where('student_id', $user->id)
            ->with(['advisor', 'coAdvisor'])
            ->first();

        if (! $bond) {
            return response()->json(['error' => 'Vínculo acadêmico não encontrado.'], 404);
        }

        $advisors = [];

        if ($bond->advisor) {
            $advisors[] = [
                'id' => $bond->advisor->id,
                'name' => $bond->advisor->name,
                'type' => 'Orientador',
            ];
        }

        if ($bond->coAdvisor) {
            $advisors[] = [
                'id' => $bond->coAdvisor->id,
                'name' => $bond->coAdvisor->name,
                'type' => 'Coorientador',
            ];
        }

        return response()->json($advisors);
    }

    /**
     * Get unread message count for current user.
     */
    public function getUnreadCount(Request $request): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        $count = Message::where('recipient_id', $user->id)
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }
}
