<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserLinkPeriodRequest extends FormRequest
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
            'start_date' => [
                'nullable',
                'date',
                function ($attribute, $value, $fail) {
                    if (!$value) return;

                    $user = auth()->user();
                    $academicBond = $user->academicBonds()->where('status', 'active')->first();

                    // Get end_date from request or database
                    $endDate = $this->input('end_date') ?: $academicBond?->end_date;

                    if ($endDate && $value > $endDate) {
                        $fail('Data de início deve ser anterior ou igual à data de término.');
                    }
                }
            ],
            'end_date' => [
                'nullable',
                'date',
                function ($attribute, $value, $fail) {
                    if (!$value) return;

                    $user = auth()->user();
                    $academicBond = $user->academicBonds()->where('status', 'active')->first();

                    // Get start_date from request or database
                    $startDate = $this->input('start_date') ?: $academicBond?->start_date;

                    if ($startDate && $value < $startDate) {
                        $fail('Data de término deve ser posterior ou igual à data de início.');
                    }
                }
            ],
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
            'start_date.date' => 'Data de início deve ser uma data válida.',
            'start_date.before_or_equal' => 'Data de início deve ser anterior ou igual à data de término.',
            'end_date.date' => 'Data de término deve ser uma data válida.',
            'end_date.after_or_equal' => 'Data de término deve ser posterior ou igual à data de início.',
        ];
    }
}
