<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddUserPublicationRequest extends FormRequest
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
            'journal_id' => ['required', 'integer', 'exists:journals,id'],
            'title' => ['required', 'string', 'max:255', 'min:3'],
            'submission_date' => ['required', 'date', 'before_or_equal:today'],
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
            'journal_id.required' => 'O periódico é obrigatório.',
            'journal_id.exists' => 'O periódico selecionado não existe.',
            'title.required' => 'O título da publicação é obrigatório.',
            'title.min' => 'O título deve ter pelo menos 3 caracteres.',
            'title.max' => 'O título deve ter no máximo 255 caracteres.',
            'submission_date.required' => 'A data de submissão é obrigatória.',
            'submission_date.date' => 'A data de submissão deve ser uma data válida.',
            'submission_date.before_or_equal' => 'A data de submissão não pode ser futura.',
        ];
    }
}
