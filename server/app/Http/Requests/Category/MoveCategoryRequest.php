<?php
namespace App\Http\Requests\Category;
use Illuminate\Foundation\Http\FormRequest;
class MoveCategoryRequest extends FormRequest
{
      public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return [
            'categoryId' => 'required|exists:categories,id',
            'categoryParentId' => 'nullable|exists:categories,id',
        ];
    }
     public function messages(): array
    {
        return [
            'categoryId.required' => 'Loại sản phẩm không được để trống!',
            'categoryParentId.required' => 'Tên loại sản phẩm cha không được để trống!',
        ];
    }
}