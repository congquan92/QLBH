<?php

namespace App\Http\Mapper;

use App\Models\Page;

class PageMapper
{
    /**
     * Chuyển đổi Model Page sang định dạng Response (DTO)
     */
    public static function toPageResponse(Page $page)
    {
        return [
            'id'         => $page->id,
            'title'      => $page->title,
            'icon'       => $page->icon,
            'sort_order' => $page->sort_order,
            'items' => $page->groupPermissions->map(function ($group) {
                return [
                    'id'          => $group->id,
                    'name'        => $group->name,
                    'url'         => $group->url,
                    'icon'        => $group->icon,
                    'status'      => $group->status,
                    'permissions' => $group->permissions->map(function ($permission) {
                        return [
                            'id'   => $permission->id,
                            'name' => $permission->name, // VD: "CREATE_PRODUCT"
                            'description' => $permission->description,
                        ];
                    }),
                ];
            }),
        ];
    }
}