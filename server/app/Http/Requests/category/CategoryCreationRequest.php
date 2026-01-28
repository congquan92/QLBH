<?php

namespace App\Http\Requests\Category;
use Illuminate\Foundation\Http\FormRequest;

class CategoryCreationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            '*.name' => 'required|string|max:255',
            '*.parentId' => 'nullable|integer|exists:categories,id',

            '*.childCategories' => 'nullable|array',
            '*.childCategories.*.name' => 'required|string|max:255',
            '*.childCategories.*.parentId' => 'nullable|integer',
            '*.childCategories.*.childCategories' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            '*.name.required' => 'Tên loại sản phẩm không được để trống!',
            '*.childCategories.*.name.required' => 'Tên loại sản phẩm con không được để trống!',
        ];
    }
}
