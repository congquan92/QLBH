<?php
namespace App\Http\Mapper;

use App\Http\Responses\GroupPermission\GroupPermissionResponse;
use App\Http\Responses\Permission\PermissionResponse;
use App\Models\GroupPermission;



class GroupPermissionMapper
{
    public static function toGroupPermissionResponse(GroupPermission $groupPermission): GroupPermissionResponse
    {
        $permissionResponses = $groupPermission->permissions->map(function ($permission) {
                return new PermissionResponse(
                    $permission->id,
                    $permission->name,
                    $permission->description ?? '',
                    $permission->status->value ?? 'ACTIVE'
                );
            })->toArray();
        return new GroupPermissionResponse(
            $groupPermission->id,
            $groupPermission->name,
            $groupPermission->description,
            $groupPermission->status->value,
            $permissionResponses
        );
    }
}