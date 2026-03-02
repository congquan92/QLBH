<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;

class RoleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('role');
        return [
            'name' => 'required|string|max:255|unique:roles,name,' . $id,
            'description' => 'nullable|string',
            'status' => 'nullable|in:ACTIVE,INACTIVE',
            'group_permission_ids' => 'required|array|min:1',
            'group_permission_ids.*' => 'exists:group_permissions,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên vai trò không được để trống.',
            'name.unique' => 'Tên vai trò này đã tồn tại.',
            'group_permission_ids.required' => 'Bạn phải chọn ít nhất một nhóm quyền cho vai trò này.',
            'group_permission_ids.*.exists' => 'Nhóm quyền được chọn không hợp lệ.',
        ];
    }
}