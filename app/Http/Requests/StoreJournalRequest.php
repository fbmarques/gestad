<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJournalRequest extends FormRequest
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
        return [
            'nome' => 'required|string|max:255',
            'instituicao' => 'nullable|string|max:255',
            'quali' => 'nullable|string|max:10',
            'issn' => 'nullable|string|max:20|unique:journals,issn',
            'tipo' => 'required|in:Nacional,Internacional',
            'description' => 'nullable|string',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'O nome da revista é obrigatório.',
            'nome.string' => 'O nome da revista deve ser um texto.',
            'nome.max' => 'O nome da revista não pode ter mais de 255 caracteres.',
            'instituicao.string' => 'A instituição deve ser um texto.',
            'instituicao.max' => 'A instituição não pode ter mais de 255 caracteres.',
            'quali.string' => 'O Qualis deve ser um texto.',
            'quali.max' => 'O Qualis não pode ter mais de 10 caracteres.',
            'issn.string' => 'O ISSN deve ser um texto.',
            'issn.max' => 'O ISSN não pode ter mais de 20 caracteres.',
            'issn.unique' => 'Este ISSN já está sendo utilizado por outra revista.',
            'tipo.required' => 'O tipo da revista é obrigatório.',
            'tipo.in' => 'O tipo da revista deve ser Nacional ou Internacional.',
            'description.string' => 'A descrição deve ser um texto.',
        ];
    }
}
