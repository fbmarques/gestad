<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserResearchDefinitionsRequest extends FormRequest
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
            'problem_defined' => ['sometimes', 'boolean'],
            'problem_text' => ['nullable', 'string', 'max:65535'],
            'question_defined' => ['sometimes', 'boolean'],
            'question_text' => ['nullable', 'string', 'max:65535'],
            'objectives_defined' => ['sometimes', 'boolean'],
            'objectives_text' => ['nullable', 'string', 'max:65535'],
            'methodology_defined' => ['sometimes', 'boolean'],
            'methodology_text' => ['nullable', 'string', 'max:65535'],
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
            'problem_defined.boolean' => 'O campo de problema definido deve ser verdadeiro ou falso.',
            'problem_text.max' => 'O texto do problema de pesquisa deve ter no máximo 65535 caracteres.',
            'question_defined.boolean' => 'O campo de pergunta definida deve ser verdadeiro ou falso.',
            'question_text.max' => 'O texto da pergunta de pesquisa deve ter no máximo 65535 caracteres.',
            'objectives_defined.boolean' => 'O campo de objetivos definidos deve ser verdadeiro ou falso.',
            'objectives_text.max' => 'O texto dos objetivos deve ter no máximo 65535 caracteres.',
            'methodology_defined.boolean' => 'O campo de metodologia definida deve ser verdadeiro ou falso.',
            'methodology_text.max' => 'O texto da metodologia deve ter no máximo 65535 caracteres.',
        ];
    }
}
