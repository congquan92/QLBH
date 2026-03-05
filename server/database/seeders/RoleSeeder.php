<?php

namespace Database\Seeders;

use App\Enums\RoleType;
use App\Enums\Status;
use App\Models\Page;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
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

            // Gán Page cho Role (Quan hệ Many-to-Many qua bảng roles_pages)
            switch ($roleEnum) {
                case RoleType::ADMIN:
                    // Admin có quyền xem tất cả các Page
                    $role->pages()->sync(Page::pluck('id'));
                    break;

                case RoleType::WAREHOUSE_STAFF:
                    // Nhân viên kho chỉ thấy Page Sản phẩm và Bán hàng
                    $warehousePages = Page::whereIn('title', [
                        'Quản lý Sản phẩm', 
                        'Quản lý Bán hàng'
                    ])->pluck('id');
                    $role->pages()->sync($warehousePages);
                    break;

                case RoleType::ORDER_STAFF:
                    // Nhân viên đơn hàng chỉ thấy Page Bán hàng
                    $orderPages = Page::whereIn('title', ['Quản lý Bán hàng'])->pluck('id');
                    $role->pages()->sync($orderPages);
                    break;

                case RoleType::USER:
                    // User thường không thấy trang quản trị nào
                    $role->pages()->sync([]);
                    break;
            }
        }
    }
}