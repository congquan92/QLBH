<?php
namespace App\Http\Requests\Category;
use Illuminate\Foundation\Http\FormRequest;
class CategoryUpdateRequest extends FormRequest
{
      public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return [
            'id' => 'required|integer',
            'name' => 'required|string|nullable',
            'status' => 'required|string|nullable',
            'parentId' => 'nullable|exists:categories,id',
        ];
    }
     public function messages(): array
    {
        return [
            'id'=>'Id loại sản phẩm không được để trống!',
        ];
    }
}