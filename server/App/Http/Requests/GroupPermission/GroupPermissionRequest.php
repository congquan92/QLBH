<?php

namespace App\Http\Requests\GroupPermission;

use Illuminate\Foundation\Http\FormRequest;

class GroupPermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('group_permission'); // Lấy ID khi update

        return [
            'name' => 'required|string|max:255|unique:group_permissions,name,' . $id,
            'description' => 'nullable|string',
            'status' => 'nullable|in:ACTIVE,INACTIVE',
            'permission_ids' => 'required|array|min:1',
            'permission_ids.*' => 'exists:permissions,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên nhóm quyền không được để trống.',
            'name.unique' => 'Tên nhóm quyền này đã tồn tại.',
            'permission_ids.required' => 'Vui lòng chọn ít nhất một quyền cho nhóm này.',
            'permission_ids.*.exists' => 'Một hoặc nhiều quyền được chọn không tồn tại trong hệ thống.',
            'status.in' => 'Trạng thái phải là ACTIVE hoặc INACTIVE.',
        ];
    }
}