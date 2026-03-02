<?php

namespace Database\Seeders;

use App\Enums\PermissionType;
use App\Enums\Status;
use App\Models\GroupPermission;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Tạo Permissions lẻ từ Enum
            foreach (PermissionType::cases() as $perm) {
                Permission::updateOrCreate(
                    ['name' => $perm->value],
                    [
                        'description' => "Quyền xử lý " . strtolower(str_replace('_', ' ', $perm->value)),
                        'status' => Status::ACTIVE->value,
                    ]
                );
            }

            // 2. Định nghĩa Nhóm Quyền và Từ khóa tự động gom nhóm
            $groupsConfig = [
                'QUẢN LÝ DANH MỤC'  => ['CATEGORIES'],
                'QUẢN LÝ SẢN PHẨM'  => ['PRODUCT', 'VARIANT', 'ATTRIBUTE', 'IMAGE_PRODUCT'],
                'QUẢN LÝ ĐƠN HÀNG'  => ['ORDER', 'SHIP', 'RETURN_ORDER'],
                'BÁO CÁO THỐNG KÊ'   => ['STATISTICAL'],
                'QUẢN LÝ NHÂN SỰ'   => ['SCHEDULE', 'SHIFT', 'LEAVE', 'HOLIDAY', 'POSITION', 'PROMOTE'],
                'QUẢN LÝ TÀI CHÍNH' => ['SALARY', 'SCALE', 'CALCULATE_SALARY'],
                'QUẢN LÝ HỆ THỐNG'  => ['ROLE', 'PERMISSION_GROUPS', 'USERS', 'STATISTICAL', 'EXPORT'],
                'QUẢN LÝ NHẬP KHO'  => ['IMPORT_PRODUCT', 'SUPPLIER'],
            ];

            foreach ($groupsConfig as $groupName => $keywords) {
                $group = GroupPermission::updateOrCreate(
                    ['name' => $groupName],
                    ['status' => Status::ACTIVE->value]
                );

                $permissionIds = Permission::where(function ($query) use ($keywords) {
                    foreach ($keywords as $keyword) {
                        $query->orWhere('name', 'LIKE', "%{$keyword}%");
                    }
                })->pluck('id');

                $group->permissions()->sync($permissionIds);
            }
        });
    }
}