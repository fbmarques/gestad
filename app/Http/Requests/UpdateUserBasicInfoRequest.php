<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserBasicInfoRequest extends FormRequest
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
            'registration' => ['nullable', 'string', 'max:10', 'regex:/^\d{1,10}$/'],
            'lattes_url' => ['nullable', 'url', 'regex:/^http:\/\/lattes\.cnpq\.br\/\d+$/'],
            'orcid' => ['nullable', 'string', 'regex:/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/'],
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
            'registration.regex' => 'A matrícula deve conter apenas números e ter no máximo 10 dígitos.',
            'registration.max' => 'A matrícula deve ter no máximo 10 dígitos.',
            'lattes_url.url' => 'O link do Lattes deve ser uma URL válida.',
            'lattes_url.regex' => 'O link do Lattes deve seguir o padrão: http://lattes.cnpq.br/NÚMEROS',
            'orcid.regex' => 'O ORCID deve seguir o padrão: 0000-0000-0000-0000',
        ];
    }
}
