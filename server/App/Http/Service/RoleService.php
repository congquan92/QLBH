<?php

namespace App\Http\Service;

use App\Http\Mapper\RoleMapper;
use App\Http\Responses\PageResponse;
use App\Models\Role;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;

class RoleService
{
    /**
     * Lấy danh sách Role có phân trang, search và load quan hệ qua Page
     */
    public function findAll(?string $keyword, ?string $sort, int $page, int $size)
    {
        // Load quan hệ Role -> Pages -> GroupPermissions
        $query = Role::with(['pages.groupPermissions.permissions']);
        
        $column = 'id';
        $direction = 'desc';

        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
        }

        if (!empty($keyword)) {
            $query->where('name', 'like', "%{$keyword}%");
        }

        $paginator = $query->orderBy($column, $direction)->paginate($size, ['*'], 'page', $page);
        
        $dtoItems = $paginator->getCollection()->map(function ($role) {
            return RoleMapper::toRoleResponse($role);
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }

    /**
     * Xem chi tiết 1 Role kèm các Page đã gán
     */
   public function getById($id)
    {
        // Khi lấy chi tiết, ta lấy các Page và chỉ các GroupPermission mà Role này sở hữu
        $role = Role::findOrFail($id);
        return RoleMapper::toRoleResponse($role);
    }

    /**
     * Tạo mới Role và gắn Pages (Many-to-Many)
     */
   public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            $role = Role::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'status' => $data['status'] ?? 'ACTIVE',
            ]);

            // THAY ĐỔI: Gán group_permission_ids thay vì page_ids
            if (!empty($data['group_permission_ids'])) {
                $role->groupPermissions()->sync($data['group_permission_ids']);
            }

            return RoleMapper::toRoleResponse($role->load('groupPermissions'));
        });
    }

    /**
     * Cập nhật Role và danh sách quyền mục con
     */
public function update($id, array $data)
{
    return DB::transaction(function () use ($id, $data) {
        $role = Role::findOrFail($id);
        $role->update($data);

        if (isset($data['group_permission_ids'])) {
            // Sau khi sửa Model, sync() sẽ thực hiện DELETE chuẩn xác
            $role->groupPermissions()->sync($data['group_permission_ids']);
        }

        // LÀM MỚI dữ liệu để xóa cache cũ trong bộ nhớ
        $role->refresh();
        
        // Nạp lại dữ liệu quan hệ đã được lọc
        $role->load('groupPermissions.page');

        return RoleMapper::toRoleResponse($role);
    });
}

    public function detachGroupPermissions($id, array $groupPermissionIds)
    {
        return DB::transaction(function () use ($id, $groupPermissionIds) {
            $role = Role::findOrFail($id);

            $role->groupPermissions()->detach($groupPermissionIds);

            $role->refresh();
            $role->load('groupPermissions.page');

            return RoleMapper::toRoleResponse($role);
        });
    }

    /**
     * Xóa Role
     */
    public function delete($id)
    {
        $role = Role::findOrFail($id);

        $userCount = User::where('role_id', $id)->count();
        if ($userCount > 0) {
            throw new Exception("Không thể xóa vai trò '{$role->name}' vì đang có {$userCount} nhân viên đảm nhiệm.");
        }

        return DB::transaction(function () use ($role) {
            // THAY ĐỔI: Xóa liên kết ở bảng roles_group_permissions
            $role->groupPermissions()->detach();
            return $role->delete();
        });
    }
}