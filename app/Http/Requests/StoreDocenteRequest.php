<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocenteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->roles()->whereIn('role_id', [1, 2])->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'research_line_id' => ['required', 'integer', 'exists:research_lines,id'],
            'is_admin' => ['boolean'],
        ];
    }

    /**
     * Get custom validation error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'O nome é obrigatório.',
            'nome.string' => 'O nome deve ser um texto válido.',
            'nome.max' => 'O nome não pode ter mais de 255 caracteres.',
            'email.required' => 'O email é obrigatório.',
            'email.email' => 'O email deve ter um formato válido.',
            'email.max' => 'O email não pode ter mais de 255 caracteres.',
            'email.unique' => 'Este email já está sendo utilizado.',
            'research_line_id.required' => 'A linha de pesquisa é obrigatória.',
            'research_line_id.integer' => 'A linha de pesquisa deve ser um número válido.',
            'research_line_id.exists' => 'A linha de pesquisa selecionada não existe.',
            'is_admin.boolean' => 'O campo admin deve ser verdadeiro ou falso.',
        ];
    }
}
