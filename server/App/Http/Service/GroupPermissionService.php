<?php

namespace App\Http\Service;

use App\Http\Mapper\GroupPermissionMapper;
use App\Http\Responses\PageResponse;
use App\Models\GroupPermission;
use Illuminate\Support\Facades\DB;

class GroupPermissionService
{
    public function findAll(?string $keyword, ?string $sort, int $page, int $size)
    {
        $query = GroupPermission::with('permissions');

        $column = 'id';
        $direction = 'desc';

        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
        }

        $query->orderBy($column, $direction);

        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%");
            });
        }

        $paginator = $query->paginate($size, ['*'], 'page', $page);
        $dtoItems = $paginator->getCollection()->map(function ($group) {
            return GroupPermissionMapper::toGroupPermissionResponse($group);
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }

    public function getById($id)
    {
        $group = GroupPermission::with('permissions')->findOrFail($id);
        return GroupPermissionMapper::toGroupPermissionResponse($group);
    }

    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            $group = GroupPermission::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'status' => $data['status'] ?? 'ACTIVE',
            ]);

            $group->permissions()->sync($data['permission_ids']);

            return $group->load('permissions');
        });
    }

    public function update($id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $group = GroupPermission::findOrFail($id);
            $group->update($data);

            if (isset($data['permission_ids'])) {
                $group->permissions()->sync($data['permission_ids']);
            }

            return $group->load('permissions');
        });
    }

    public function delete($id)
    {
        $group = GroupPermission::withCount('roles')->findOrFail($id);
        if ($group->roles_count > 0) {
            throw new \Exception("Không thể xóa nhóm quyền này vì nó đang được áp dụng cho {$group->roles_count} vai trò.");
        }

        return DB::transaction(function () use ($group) {
            $group->permissions()->detach();
            return $group->delete();
        });
    }
    public function detachPermissions($groupId, array $permissionIds)
    {
        $group = GroupPermission::findOrFail($groupId);
        $group->permissions()->detach($permissionIds);

        return GroupPermissionMapper::toGroupPermissionResponse($group->load('permissions'));
    }
}