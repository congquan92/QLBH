<?php
namespace App\Http\Mapper;

use App\Http\Responses\Role\RoleResponse;
use App\Models\Role;


class RoleMapper
{
    public static function toRoleResponse(Role $role): RoleResponse
    {
        $groupPermission = $role->groupPermissions->map(function ($permission) {
            return GroupPermissionMapper::toGroupPermissionResponse($permission);
        })->toArray();
        return new RoleResponse(
            $role->id,
            $role->name,
            $role->description,
            $role->status,
            $groupPermission
        );
    }
}