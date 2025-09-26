<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDiscenteRequest extends FormRequest
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
            'nome' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->route('discente')),
            ],
            'orientador_id' => 'required|exists:users,id',
            'co_orientador_id' => 'nullable|exists:users,id|different:orientador_id',
            'nivel_pos_graduacao' => 'required|in:mestrado,doutorado',
        ];
    }

    /**
     * Get the custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'O nome é obrigatório.',
            'nome.string' => 'O nome deve ser uma string válida.',
            'nome.max' => 'O nome não pode ter mais que 255 caracteres.',
            'email.required' => 'O email é obrigatório.',
            'email.email' => 'O email deve ser um endereço de email válido.',
            'email.unique' => 'Este email já está sendo usado por outro usuário.',
            'email.max' => 'O email não pode ter mais que 255 caracteres.',
            'orientador_id.required' => 'O orientador é obrigatório.',
            'orientador_id.exists' => 'O orientador selecionado não existe.',
            'co_orientador_id.exists' => 'O co-orientador selecionado não existe.',
            'co_orientador_id.different' => 'O co-orientador deve ser diferente do orientador.',
            'nivel_pos_graduacao.required' => 'O nível de pós-graduação é obrigatório.',
            'nivel_pos_graduacao.in' => 'O nível de pós-graduação deve ser mestrado ou doutorado.',
        ];
    }
}
