<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserAcademicRequirementsRequest extends FormRequest
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
            'qualification_status' => ['nullable', 'in:Not Scheduled,Scheduled,Completed'],
            'qualification_date' => [
                'nullable',
                'date',
            ],
            'qualification_completion_date' => [
                'nullable',
                'date',
                function ($attribute, $value, $fail) {
                    if (! $value) {
                        return;
                    }

                    $qualificationStatus = $this->input('qualification_status');
                    if ($qualificationStatus !== 'Completed') {
                        $fail('Data de conclusão da qualificação só pode ser definida quando qualificação estiver concluída.');
                    }

                    $qualificationDate = $this->input('qualification_date');
                    if ($qualificationDate && $value < $qualificationDate) {
                        $fail('Data de conclusão deve ser posterior ou igual à data da qualificação.');
                    }
                },
            ],
            'defense_status' => ['nullable', 'in:Not Scheduled,Scheduled,Completed'],
            'defense_date' => [
                'nullable',
                'date',
            ],
            'defense_completion_date' => [
                'nullable',
                'date',
                function ($attribute, $value, $fail) {
                    if (! $value) {
                        return;
                    }

                    $defenseStatus = $this->input('defense_status');
                    if ($defenseStatus !== 'Completed') {
                        $fail('Data de conclusão da defesa só pode ser definida quando defesa estiver concluída.');
                    }

                    $defenseDate = $this->input('defense_date');
                    if ($defenseDate && $value < $defenseDate) {
                        $fail('Data de conclusão deve ser posterior ou igual à data da defesa.');
                    }
                },
            ],
            'work_completed' => ['nullable', 'boolean'],
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
            'qualification_status.in' => 'Status da qualificação deve ser: Não Agendado, Agendado ou Concluído.',
            'qualification_date.date' => 'Data da qualificação deve ser uma data válida.',
            'qualification_completion_date.date' => 'Data de conclusão da qualificação deve ser uma data válida.',
            'defense_status.in' => 'Status da defesa deve ser: Não Agendado, Agendado ou Concluído.',
            'defense_date.date' => 'Data da defesa deve ser uma data válida.',
            'defense_completion_date.date' => 'Data de conclusão da defesa deve ser uma data válida.',
            'work_completed.boolean' => 'Status do trabalho deve ser verdadeiro ou falso.',
        ];
    }
}
