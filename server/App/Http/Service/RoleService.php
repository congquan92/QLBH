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
        $role = Role::with(['pages.groupPermissions.permissions'])->findOrFail($id);
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

            // Gán danh sách các Page cho Role này qua bảng trung gian roles_pages
            if (!empty($data['page_ids'])) {
                $role->pages()->sync($data['page_ids']);
            }

            return RoleMapper::toRoleResponse($role->load('pages.groupPermissions.permissions'));
        });
    }

    /**
     * Cập nhật Role và cập nhật danh sách Pages
     */
    public function update($id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $role = Role::findOrFail($id);
            $role->update($data);

            // Cập nhật lại danh sách Page bằng phương thức sync
            if (isset($data['page_ids'])) {
                $role->pages()->sync($data['page_ids']);
            }

            return RoleMapper::toRoleResponse($role->load('pages.groupPermissions.permissions'));
        });
    }

    /**
     * Gỡ bỏ các Page ra khỏi Role
     */
    public function detachPages($roleId, array $pageIds)
    {
        $role = Role::findOrFail($roleId);
        $role->pages()->detach($pageIds);
        
        return RoleMapper::toRoleResponse($role->load('pages.groupPermissions.permissions'));
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
            // Xóa toàn bộ liên kết trong bảng roles_pages
            $role->pages()->detach();
            
            return $role->delete();
        });
    }
}