<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class PositionCreationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // phân quyền xử lý bằng middleware / gate
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'base_salary' => 'required|numeric|gt:0|decimal:0,2',
            'salary_type' => 'string|max:255'
        ];
    }


    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required',
            'base_salary.gt' => 'Base salary must be greater than 0',
            'base_salary.required' => 'Base salary is required',
            'imageProduct.min' => 'At least 1 product image is required',
        ];
    }
}
