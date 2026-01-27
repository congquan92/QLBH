<?php

namespace App\Http\Requests\AttributeValue;

use Illuminate\Foundation\Http\FormRequest;

class AttributeValueCreationRequest extends FormRequest
{
    /**
     * Tương đương với việc phân quyền (thường để true nếu dùng Middleware)
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Định nghĩa các quy tắc Validation
     * Tương đương với @NotBlank và các annotation khác trong Java
     */
    public function rules(): array
    {
        return [
            // @NotBlank tương đương 'required|string'
            'value' => 'required|string|max:255',
            
            // Trường image không bắt buộc (private String image)
            'image' => 'nullable|string', 
        ];
    }

    /**
     * Tương đương với (message = "Attribute value not blank")
     */
    public function messages(): array
    {
        return [
            'value.required' => 'Attribute value not blank',
        ];
    }
}