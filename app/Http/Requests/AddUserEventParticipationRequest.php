<?php

namespace App\Http\Requests;

use App\Models\EventParticipation;
use Illuminate\Foundation\Http\FormRequest;

class AddUserEventParticipationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isDiscente();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'title' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'min:2000', 'max:'.(date('Y') + 1)],
            'type' => ['required', 'string', 'in:'.implode(',', EventParticipation::TYPES)],
        ];
    }

    /**
     * Get custom error messages for validation.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'event_id.required' => 'O evento é obrigatório.',
            'event_id.exists' => 'O evento selecionado não existe.',
            'title.required' => 'O título do trabalho é obrigatório.',
            'title.max' => 'O título do trabalho deve ter no máximo 255 caracteres.',
            'name.required' => 'O nome do evento é obrigatório.',
            'name.max' => 'O nome do evento deve ter no máximo 255 caracteres.',
            'location.required' => 'O local é obrigatório.',
            'location.max' => 'O local deve ter no máximo 255 caracteres.',
            'year.required' => 'O ano é obrigatório.',
            'year.integer' => 'O ano deve ser um número inteiro.',
            'year.min' => 'O ano deve ser 2000 ou posterior.',
            'year.max' => 'O ano não pode ser superior ao próximo ano.',
            'type.required' => 'O tipo de trabalho é obrigatório.',
            'type.in' => 'O tipo de trabalho deve ser: Conferência, Simpósio, Workshop ou Congresso.',
        ];
    }
}
