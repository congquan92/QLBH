<?php

namespace App\Http\Mapper;

use App\Http\Responses\Role\RoleResponse;
use App\Models\Role;

class RoleMapper
{
    public static function toRoleResponse(Role $role): RoleResponse
    {
        // 1. Lấy danh sách GroupPermissions mà Role sở hữu
        $allowedGroups = $role->groupPermissions()->with('page')->get(); 

        // 2. Nhóm các Group này theo Page
        $groupedByPage = $allowedGroups->groupBy('page_id');

        // 3. Chuyển đổi sang danh sách Page Models và sắp xếp
        $pageResponse = $groupedByPage->map(function ($items) {
            $page = $items->first()->page;
            if (!$page) return null;

            // Gán danh sách Group đã lọc vào Model Page
            $page->setRelation('groupPermissions', $items);
            return $page;
        })
        ->filter()
        // 4. Sắp xếp trên Model Page (Truy cập trực tiếp thuộc tính DB)
        ->sortBy('sort_order') 
        // 5. Sau khi sắp xếp xong mới Map sang DTO Response
        ->map(function ($page) {
            return PageMapper::toPageResponse($page);
        })
        ->values()
        ->toArray();

        return new RoleResponse(
            $role->id, 
            $role->name, 
            $role->description, 
            $role->status->value, 
            $pageResponse
        );
    }
}