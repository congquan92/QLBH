<?php

namespace App\Http\Requests\Salary;

use Illuminate\Foundation\Http\FormRequest;


class SalaryConfigUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [
            'rule_name' => 'nullable|string|max:255',
            'employee_type' => 'nullable|string',
            'multiplier' => 'nullable|decimal:0,2|gt:0',
            'is_holiday' => 'nullable|boolean',
        ];
    }
    public function messages(): array
    {
        return [
            'multiplier.gt'      => 'Hệ số lương phải lớn hơn 0!',
        ];
    }
}