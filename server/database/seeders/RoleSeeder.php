<?php

namespace Database\Seeders;

use App\Enums\RoleType;
use App\Enums\Status;
use App\Models\GroupPermission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (RoleType::cases() as $roleEnum) {
            // 1. Tạo hoặc cập nhật Role
            $role = Role::updateOrCreate(
                ['name' => $roleEnum->value],
                [
                    'description' => $roleEnum->description(),
                    'status' => Status::ACTIVE->value,
                ]
            );

            // 2. Logic gán Nhóm quyền (GroupPermission) thực tế
            switch ($roleEnum) {
                case RoleType::ADMIN:
                    $allGroupIds = GroupPermission::pluck('id');
                    $role->groupPermissions()->sync($allGroupIds);
                    break;

                case RoleType::WAREHOUSE_STAFF:
                    $warehouseGroups = GroupPermission::whereIn('name', [
                        'QUẢN LÝ SẢN PHẨM', 
                        'QUẢN LÝ DANH MỤC', 
                        'QUẢN LÝ NHẬP KHO'
                    ])->pluck('id');
                    $role->groupPermissions()->sync($warehouseGroups);
                    break;

                case RoleType::ORDER_STAFF:
                    // Nhân viên vận đơn: Tập trung vào xử lý đơn hàng
                    $orderGroups = GroupPermission::whereIn('name', [
                        'QUẢN LÝ ĐƠN HÀNG'
                    ])->pluck('id');
                    $role->groupPermissions()->sync($orderGroups);
                    break;

                case RoleType::USER:
                    $role->groupPermissions()->sync([]);
                    break;
            }
        }
    }
}