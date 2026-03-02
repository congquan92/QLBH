<?php

namespace App\Http\Service;

use App\Models\Role;
use App\Models\User;
use App\Http\Mapper\RoleMapper;
use App\Http\Responses\PageResponse;
use Illuminate\Support\Facades\DB;
use Exception;

class RoleService
{
    /**
     * Lấy danh sách Role có phân trang, search và sort
     */
    public function findAll(?string $keyword, ?string $sort, int $page, int $size)
    {
        $query = Role::with(['groupPermissions.permissions']);
        
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
     * Xem chi tiết 1 Role
     */
    public function getById($id)
    {
        $role = Role::with(['groupPermissions.permissions'])->findOrFail($id);
        return RoleMapper::toRoleResponse($role);
    }

    /**
     * Tạo mới Role và gắn Group Permissions
     */
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            $role = Role::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'status' => $data['status'] ?? 'ACTIVE',
            ]);

            if (!empty($data['group_permission_ids'])) {
                $role->groupPermissions()->sync($data['group_permission_ids']);
            }

            return RoleMapper::toRoleResponse($role->load('groupPermissions.permissions'));
        });
    }

    /**
     * Cập nhật Role (Dùng sync để ghi đè danh sách Group)
     */
    public function update($id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $role = Role::findOrFail($id);
            $role->update($data);

            if (isset($data['group_permission_ids'])) {
                $role->groupPermissions()->sync($data['group_permission_ids']);
            }

            return RoleMapper::toRoleResponse($role->load('groupPermissions.permissions'));
        });
    }

    /**
     * HỦY LIÊN KẾT: Gỡ một hoặc nhiều Group Permission ra khỏi Role
     * Truyền vào mảng [id1, id2, ...]
     */
    public function detachGroups($roleId, array $groupIds)
    {
        $role = Role::findOrFail($roleId);
        
        // detach() chỉ xóa các dòng có group_permission_id nằm trong mảng $groupIds
        $role->groupPermissions()->detach($groupIds);
        
        return RoleMapper::toRoleResponse($role->load('groupPermissions.permissions'));
    }

    /**
     * XÓA VAI TRÒ: Kiểm tra tham chiếu User trước khi xóa
     */
    public function delete($id)
    {
        $role = Role::findOrFail($id);

        // Kiểm tra xem có User nào đang sử dụng Role này không
        // Giả sử quan hệ trong Role model là users()
        $userCount = User::where('role_id', $id)->count();

        if ($userCount > 0) {
            throw new Exception("Không thể xóa vai trò '{$role->name}' vì đang có {$userCount} nhân viên đảm nhiệm vai trò này.");
        }

        return DB::transaction(function () use ($role) {
            // Hủy toàn bộ liên kết ở bảng trung gian role_group_permission
            $role->groupPermissions()->detach();
            
            // Xóa bản ghi Role
            return $role->delete();
        });
    }
}