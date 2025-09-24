<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreResearchLineRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'alias' => 'required|string|max:255',
            'description' => 'nullable|string',
            'coordinator_id' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'O nome da linha de pesquisa é obrigatório.',
            'name.max' => 'O nome da linha de pesquisa não pode ter mais de 255 caracteres.',
            'alias.required' => 'O apelido da linha de pesquisa é obrigatório.',
            'alias.max' => 'O apelido da linha de pesquisa não pode ter mais de 255 caracteres.',
            'coordinator_id.exists' => 'O coordenador selecionado não existe.',
        ];
    }
}
