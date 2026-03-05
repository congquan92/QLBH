<?php
namespace App\Http\Mapper;

use App\Http\Responses\Role\RoleResponse;
use App\Models\Role;


class RoleMapper
{
    public static function toRoleResponse(Role $role): RoleResponse
    {
        $pageResponse = $role->pages->map(function ($page) {
            return PageMapper::toPageResponse($page);
        })->toArray();
        return new RoleResponse(
            $role->id,
            $role->name,
            $role->description,
            $role->status->value,
            $pageResponse
        );
    }
}