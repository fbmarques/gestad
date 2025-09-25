<?php

namespace App\Http\Requests;

use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && $user->roles()->whereIn('role_id', [1, 2])->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $eventId = $this->route('event');

        return [
            'nome' => ['required', 'string', 'max:255'],
            'alias' => ['required', 'string', 'max:50', Rule::unique('events', 'alias')->ignore($eventId)],
            'tipo' => ['required', 'string', Rule::in(Event::TIPOS)],
            'natureza' => ['required', 'string', Rule::in(Event::NATUREZAS)],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do evento é obrigatório.',
            'nome.max' => 'O nome do evento não pode ter mais de 255 caracteres.',
            'alias.required' => 'O alias/sigla do evento é obrigatório.',
            'alias.unique' => 'Este alias/sigla já está sendo usado por outro evento.',
            'alias.max' => 'O alias/sigla não pode ter mais de 50 caracteres.',
            'tipo.required' => 'O tipo do evento é obrigatório.',
            'tipo.in' => 'O tipo selecionado é inválido.',
            'natureza.required' => 'A natureza do evento é obrigatória.',
            'natureza.in' => 'A natureza selecionada é inválida.',
        ];
    }
}
