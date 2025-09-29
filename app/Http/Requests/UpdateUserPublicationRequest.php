<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserPublicationRequest extends FormRequest
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
            'approval_date' => [
                'nullable',
                'date',
                'before_or_equal:today',
                function ($attribute, $value, $fail) {
                    if (!$value) return;

                    // Get publication from route
                    $publication = $this->route('publication');

                    // Approval date should be after submission date
                    if ($publication && $publication->submission_date && $value < $publication->submission_date) {
                        $fail('Data de aprovação deve ser posterior à data de submissão.');
                    }

                    // Get publication_date from request or database
                    $publicationDate = $this->input('publication_date') ?: $publication?->publication_date;

                    if ($publicationDate && $value > $publicationDate) {
                        $fail('Data de aprovação deve ser anterior ou igual à data de publicação.');
                    }
                }
            ],
            'publication_date' => [
                'nullable',
                'date',
                'before_or_equal:today',
                function ($attribute, $value, $fail) {
                    if (!$value) return;

                    // Get publication from route
                    $publication = $this->route('publication');

                    // Publication date should be after submission date
                    if ($publication && $publication->submission_date && $value < $publication->submission_date) {
                        $fail('Data de publicação deve ser posterior à data de submissão.');
                    }

                    // Get approval_date from request or database
                    $approvalDate = $this->input('approval_date') ?: $publication?->approval_date;

                    if ($approvalDate && $value < $approvalDate) {
                        $fail('Data de publicação deve ser posterior ou igual à data de aprovação.');
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
            'approval_date.date' => 'A data de aprovação deve ser uma data válida.',
            'approval_date.before_or_equal' => 'A data de aprovação não pode ser futura.',
            'publication_date.date' => 'A data de publicação deve ser uma data válida.',
            'publication_date.before_or_equal' => 'A data de publicação não pode ser futura.',
        ];
    }
}
