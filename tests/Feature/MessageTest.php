<?php

namespace Tests\Feature;

use App\Models\AcademicBond;
use App\Models\Message;
use App\Models\ResearchLine;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    protected User $docenteUser;

    protected User $studentUser;

    protected AcademicBond $bond;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['id' => 1, 'name' => 'Administrador', 'slug' => 'admin']);
        Role::create(['id' => 2, 'name' => 'Docente', 'slug' => 'docente']);
        Role::create(['id' => 3, 'name' => 'Discente', 'slug' => 'discente']);

        // Create research line
        $researchLine = ResearchLine::create([
            'name' => 'Inteligência Artificial',
            'alias' => 'IA',
            'description' => 'Linha de pesquisa em IA',
        ]);

        // Create docente user
        $this->docenteUser = User::create([
            'name' => 'Docente User',
            'email' => 'docente@test.com',
            'password' => 'password123',
            'research_line_id' => $researchLine->id,
        ]);
        $this->docenteUser->roles()->attach(2);

        // Create student user
        $this->studentUser = User::create([
            'name' => 'Student User',
            'email' => 'student@test.com',
            'password' => 'password123',
        ]);
        $this->studentUser->roles()->attach(3);

        // Create academic bond (linking student to advisor)
        $this->bond = AcademicBond::create([
            'student_id' => $this->studentUser->id,
            'advisor_id' => $this->docenteUser->id,
            'research_line_id' => $researchLine->id,
            'level' => 'mestrado',
            'status' => 'cursando',
            'start_date' => now(),
            'title' => 'Test Research',
        ]);
    }

    public function test_docente_can_get_students_list()
    {
        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->getJson('/api/messages/students');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'nome',
                    'tipo',
                ],
            ]);
    }

    public function test_discente_cannot_get_students_list()
    {
        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson('/api/messages/students');

        $response->assertStatus(403);
    }

    public function test_discente_can_get_advisors_list()
    {
        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson('/api/messages/advisors');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name',
                    'type',
                ],
            ]);
    }

    public function test_docente_cannot_get_advisors_list()
    {
        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->getJson('/api/messages/advisors');

        $response->assertStatus(403);
    }

    public function test_docente_can_send_message_to_student()
    {
        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->postJson('/api/messages/send', [
                'recipient_id' => $this->studentUser->id,
                'body' => 'Hello student!',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'text',
                'sender',
                'timestamp',
                'isRead',
            ]);

        $this->assertDatabaseHas('messages', [
            'sender_id' => $this->docenteUser->id,
            'recipient_id' => $this->studentUser->id,
            'body' => 'Hello student!',
        ]);
    }

    public function test_student_can_send_message_to_advisor()
    {
        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->postJson('/api/messages/send', [
                'recipient_id' => $this->docenteUser->id,
                'body' => 'Hello professor!',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'text',
                'sender',
                'timestamp',
                'isRead',
            ]);

        $this->assertDatabaseHas('messages', [
            'sender_id' => $this->studentUser->id,
            'recipient_id' => $this->docenteUser->id,
            'body' => 'Hello professor!',
        ]);
    }

    public function test_cannot_send_message_without_relationship()
    {
        // Create another user with no relationship to the student
        $otherDocente = User::create([
            'name' => 'Other Docente',
            'email' => 'other@test.com',
            'password' => 'password123',
        ]);
        $otherDocente->roles()->attach(2);

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->postJson('/api/messages/send', [
                'recipient_id' => $otherDocente->id,
                'body' => 'Unauthorized message',
            ]);

        $response->assertStatus(403);
    }

    public function test_send_message_requires_recipient_id()
    {
        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->postJson('/api/messages/send', [
                'body' => 'Hello!',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['recipient_id']);
    }

    public function test_send_message_requires_body()
    {
        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->postJson('/api/messages/send', [
                'recipient_id' => $this->studentUser->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['body']);
    }

    public function test_can_get_conversation_between_advisor_and_student()
    {
        // Create some messages
        Message::create([
            'sender_id' => $this->docenteUser->id,
            'recipient_id' => $this->studentUser->id,
            'subject' => 'Test',
            'body' => 'Message from advisor',
        ]);

        Message::create([
            'sender_id' => $this->studentUser->id,
            'recipient_id' => $this->docenteUser->id,
            'subject' => 'Re: Test',
            'body' => 'Message from student',
        ]);

        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->getJson("/api/messages/conversation/{$this->studentUser->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'text',
                    'sender',
                    'timestamp',
                    'isRead',
                ],
            ]);
    }

    public function test_messages_are_marked_as_read_when_conversation_is_opened()
    {
        // Create unread message
        $message = Message::create([
            'sender_id' => $this->studentUser->id,
            'recipient_id' => $this->docenteUser->id,
            'subject' => 'Test',
            'body' => 'Unread message',
            'is_read' => false,
        ]);

        $this->assertFalse($message->is_read);
        $this->assertNull($message->read_at);

        // Open conversation as docente
        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->getJson("/api/messages/conversation/{$this->studentUser->id}");

        $response->assertStatus(200);

        // Check message was marked as read
        $message->refresh();
        $this->assertTrue($message->is_read);
        $this->assertNotNull($message->read_at);
    }

    public function test_can_get_unread_message_count()
    {
        // Create unread messages
        Message::create([
            'sender_id' => $this->studentUser->id,
            'recipient_id' => $this->docenteUser->id,
            'subject' => 'Test 1',
            'body' => 'Unread message 1',
            'is_read' => false,
        ]);

        Message::create([
            'sender_id' => $this->studentUser->id,
            'recipient_id' => $this->docenteUser->id,
            'subject' => 'Test 2',
            'body' => 'Unread message 2',
            'is_read' => false,
        ]);

        $response = $this->actingAs($this->docenteUser, 'sanctum')
            ->getJson('/api/messages/unread-count');

        $response->assertStatus(200)
            ->assertJson(['count' => 2]);
    }

    public function test_unauthenticated_users_cannot_access_messages()
    {
        $response = $this->getJson('/api/messages/students');
        $response->assertStatus(401);

        $response = $this->getJson('/api/messages/advisors');
        $response->assertStatus(401);

        $response = $this->getJson('/api/messages/unread-count');
        $response->assertStatus(401);

        $response = $this->postJson('/api/messages/send', [
            'recipient_id' => $this->studentUser->id,
            'body' => 'Test',
        ]);
        $response->assertStatus(401);
    }
}
