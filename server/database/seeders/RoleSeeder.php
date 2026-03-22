<?php

namespace Database\Seeders;

use App\Enums\RoleType;
use App\Enums\Status;
use App\Models\GroupPermission;
use App\Models\Page;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    // Database/Seeders/RoleSeeder.php

    public function run(): void
    {
        foreach (RoleType::cases() as $roleEnum) {
            $role = Role::updateOrCreate(
                ['name' => $roleEnum->value],
                [
                    'description' => $roleEnum->description(),
                    'status' => Status::ACTIVE,
                ]
            );

            switch ($roleEnum) {
                case RoleType::ADMIN:
                    // Admin lấy tất cả GroupPermission
                    $role->groupPermissions()->sync(GroupPermission::pluck('id'));
                    break;

                case RoleType::WAREHOUSE_STAFF:
                    // Sản phẩm + Bán hàng + Cá nhân (lịch & nghỉ phép)
                    $ids = GroupPermission::whereHas('page', function ($q) {
                        $q->whereIn('title', ['Quản lý Sản phẩm', 'Quản lý Bán hàng', 'Cá nhân']);
                    })->pluck('id');

                    $role->groupPermissions()->sync($ids);
                    break;

                case RoleType::ORDER_STAFF:
                    // Bán hàng + Cá nhân (lịch & nghỉ phép)
                    $ids = GroupPermission::whereHas('page', function ($q) {
                        $q->whereIn('title', ['Quản lý Bán hàng', 'Cá nhân']);
                    })->pluck('id');
                    $role->groupPermissions()->sync($ids);
                    break;

                case RoleType::USER:
                    $role->groupPermissions()->sync([]);
                    break;
            }
        }
    }
}