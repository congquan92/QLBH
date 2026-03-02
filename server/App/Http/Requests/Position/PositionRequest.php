<?php

namespace App\Http\Requests\Position;

use Illuminate\Foundation\Http\FormRequest;

class PositionRequest extends FormRequest
{
  public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'base_salary' => 'required|numeric|gt:0',
            'salary_type' => 'required|string|in:HOURLY,MONTHLY', 
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên chức vụ không được để trống.',
            'name.string' => 'Tên chức vụ phải là dạng chuỗi ký tự.',
            'base_salary.required' => 'Mức lương cơ bản là bắt buộc.',
            'base_salary.numeric' => 'Mức lương phải là một con số.',
            'base_salary.gt' => 'Mức lương phải lớn hơn 0.',
            'salary_type.required' => 'Loại lương không được để trống.',
            'salary_type.in' => 'Loại lương phải là HOURLY hoặc MONTHLY.',
        ];
    }
}
