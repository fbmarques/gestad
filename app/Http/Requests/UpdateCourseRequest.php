<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = auth()->user();

        return $user && $user->roles()->whereIn('role_id', [1, 2])->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('courses', 'code')->ignore($this->course->id)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'credits' => ['required', 'integer', 'min:1', 'max:99999'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.required' => 'O código da disciplina é obrigatório.',
            'code.string' => 'O código deve ser um texto válido.',
            'code.max' => 'O código não pode ter mais que 20 caracteres.',
            'code.unique' => 'Este código já está sendo usado por outra disciplina.',
            'name.required' => 'O nome da disciplina é obrigatório.',
            'name.string' => 'O nome deve ser um texto válido.',
            'name.max' => 'O nome não pode ter mais que 255 caracteres.',
            'description.string' => 'A descrição deve ser um texto válido.',
            'credits.required' => 'O número de créditos é obrigatório.',
            'credits.integer' => 'O número de créditos deve ser um número inteiro.',
            'credits.min' => 'O número de créditos deve ser no mínimo 1.',
            'credits.max' => 'O número de créditos não pode ser maior que 99999.',
        ];
    }
}
