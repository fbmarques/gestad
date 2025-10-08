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

        // Get students where user is advisor or co-advisor
        $students = User::query()
            ->whereHas('academicBonds', function ($query) use ($user) {
                $query->where('advisor_id', $user->id)
                    ->orWhere('co_advisor_id', $user->id);
            })
            ->with(['academicBonds' => function ($query) use ($user) {
                $query->where('advisor_id', $user->id)
                    ->orWhere('co_advisor_id', $user->id);
            }])
            ->get()
            ->map(function ($student) use ($user) {
                // Get latest message between teacher and student
                $latestMessage = Message::conversationBetween($user->id, $student->id)
                    ->latest()
                    ->first();

                // Count unread messages from student to teacher
                $unreadCount = Message::where('sender_id', $student->id)
                    ->where('recipient_id', $user->id)
                    ->unread()
                    ->count();

                $bond = $student->academicBonds->first();

                return [
                    'id' => (string) $student->id,
                    'nome' => $student->name,
                    'tipo' => $bond?->level ?? 'mestrado',
                    'ultimaMensagem' => $latestMessage?->body,
                    'horaUltimaMensagem' => $latestMessage?->created_at->toISOString(),
                    'mensagensNaoLidas' => $unreadCount,
                ];
            });

        return response()->json($students);
    }

    /**
     * Get conversation between two users.
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

        // Verify that users have a relationship (advisor-student or co-advisor-student)
        $hasRelationship = AcademicBond::where(function ($query) use ($currentUser, $otherUser) {
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
        })->exists();

        if (! $hasRelationship) {
            return response()->json(['error' => 'Você não tem permissão para conversar com este usuário.'], 403);
        }

        $messages = Message::conversationBetween($currentUser->id, $userId)
            ->with(['sender', 'recipient'])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) use ($currentUser) {
                return [
                    'id' => (string) $message->id,
                    'text' => $message->body,
                    'sender' => $message->sender_id === $currentUser->id ? 'user' : 'other',
                    'timestamp' => $message->created_at->toISOString(),
                    'isRead' => $message->is_read,
                    'readAt' => $message->read_at?->toISOString(),
                ];
            });

        // Mark messages as read
        Message::where('recipient_id', $currentUser->id)
            ->where('sender_id', $userId)
            ->unread()
            ->get()
            ->each(function ($message) {
                $message->markAsRead();
            });

        return response()->json($messages);
    }

    /**
     * Send a message.
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

        // Verify relationship
        $hasRelationship = AcademicBond::where(function ($query) use ($currentUser, $recipientId) {
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
        })->exists();

        if (! $hasRelationship) {
            return response()->json(['error' => 'Você não tem permissão para enviar mensagens para este usuário.'], 403);
        }

        $message = Message::create([
            'sender_id' => $currentUser->id,
            'recipient_id' => $recipientId,
            'subject' => $request->validated()['subject'] ?? 'Mensagem',
            'body' => $request->validated()['body'],
            'priority' => $request->validated()['priority'] ?? 'normal',
        ]);

        return response()->json([
            'id' => (string) $message->id,
            'text' => $message->body,
            'sender' => 'user',
            'timestamp' => $message->created_at->toISOString(),
            'isRead' => false,
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
