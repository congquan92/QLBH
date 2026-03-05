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
                'url' => $data['url'],
                'icon' => $data['icon'],
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
        $group = GroupPermission::where('id', $id)->firstOrFail();

        return DB::transaction(function () use ($group) {
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