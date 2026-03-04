<?php

namespace App\Http\Requests\PageRequest;

use Illuminate\Foundation\Http\FormRequest;

class PageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Cho phép thực hiện request
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255|unique:pages,title,' . $this->route('page'),
            'icon' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer|min:0',
            'group_permission_ids' => 'nullable|array',
            'group_permission_ids.*' => 'exists:group_permissions,id',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Tiêu đề trang không được để trống.',
            'title.unique' => 'Tiêu đề trang này đã tồn tại.',
            'group_permission_ids.required' => 'Vui lòng chọn ít nhất một nhóm   vai trò được phép truy cập.',
        ];
    }
}