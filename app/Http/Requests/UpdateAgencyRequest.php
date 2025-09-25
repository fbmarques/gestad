<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->roles()->whereIn('role_id', [1, 2])->exists();
    }

    public function rules(): array
    {
        $agencyId = $this->route('agency')->id;

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('agencies', 'name')->ignore($agencyId)],
            'alias' => ['required', 'string', 'max:255', Rule::unique('agencies', 'alias')->ignore($agencyId)],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome da agência é obrigatório.',
            'name.unique' => 'Já existe uma agência com este nome.',
            'alias.required' => 'O apelido da agência é obrigatório.',
            'alias.unique' => 'Já existe uma agência com este apelido.',
        ];
    }
}
