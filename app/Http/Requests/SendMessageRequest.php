<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'recipient_id' => ['required', 'integer', 'exists:users,id'],
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'priority' => ['nullable', 'string', 'in:low,normal,high,urgent'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'recipient_id.required' => 'O destinatário é obrigatório.',
            'recipient_id.exists' => 'O destinatário selecionado não existe.',
            'body.required' => 'O corpo da mensagem é obrigatório.',
            'priority.in' => 'A prioridade deve ser: low, normal, high ou urgent.',
        ];
    }
}
