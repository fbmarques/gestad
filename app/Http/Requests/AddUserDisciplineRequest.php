<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddUserDisciplineRequest extends FormRequest
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
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'docente_id' => ['nullable', 'integer', 'exists:users,id'],
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
            'course_id.required' => 'É obrigatório selecionar uma disciplina.',
            'course_id.integer' => 'ID da disciplina deve ser um número inteiro.',
            'course_id.exists' => 'A disciplina selecionada não existe.',
            'docente_id.integer' => 'ID do docente deve ser um número inteiro.',
            'docente_id.exists' => 'O docente selecionado não existe.',
        ];
    }
}
