<?php

namespace Database\Seeders;

use App\Enums\PermissionType;
use App\Enums\Status;
use App\Models\GroupPermission;
use App\Models\Page;
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
                        'status' => Status::ACTIVE,
                    ]
                );
            }

            // 2. Định nghĩa cấu trúc Menu (Page -> Group)
            $structure = [
                'Quản lý Sản phẩm' => [
                    'icon' => 'Package', 'sort' => 1,
                    'groups' => [
                        'Danh mục' => ['/admin/categories', 'Layers', ['CATEGORIES']],
                        'Sản phẩm' => ['/admin/products', 'Box', ['PRODUCT', 'VARIANT', 'ATTRIBUTE', 'IMAGE_PRODUCT']],
                        'Đánh giá' => ['/admin/reviews', 'Star', ['REVIEWS']],
                        'Khuyến mãi' => ['/admin/vouchers', 'Ticket', ['VOUCHER']],
                    ]
                ],
                'Quản lý Bán hàng' => [
                    'icon' => 'ShoppingCart', 'sort' => 2,
                    'groups' => [
                        'Đơn hàng' => ['/admin/orders', 'ClipboardList', ['ORDER', 'SHIP', 'RETURN_ORDER']],
                        'Kho hàng' => ['/admin/inventory', 'Warehouse', ['IMPORT_PRODUCT', 'SUPPLIER']],
                    ]
                ],
                'Quản lý Nhân sự' => [
                    'icon' => 'Users', 'sort' => 3,
                    'groups' => [
                        'Nhân viên' => ['/admin/employees', 'UserGroup', ['USERS', 'PROMOTE','ASSIGN']],
                        'Lịch làm việc' => ['/admin/schedules', 'Calendar', ['SCHEDULE', 'SHIFT']],
                        'Nghỉ phép' => ['/admin/leave', 'LogOut', ['LEAVE', 'HOLIDAY']],
                        'Lương & Chức vụ' => ['/admin/salary', 'Coins', ['SALARY', 'SCALE', 'POSITION']],
                    ]
                ],
                'Hệ thống' => [
                    'icon' => 'Settings', 'sort' => 4,
                    'groups' => [
                        'Tài khoản' => ['/admin/users', 'UserCog', ['USERS']],
                        'Phân quyền' => ['/admin/roles', 'ShieldCheck', ['ROLE', 'PERMISSION_GROUPS']],
                        'Hạng người dùng' => ['/admin/user-ranks', 'Medal', ['USER_RANK']],
                        'Thống kê' => ['/admin/statistical', 'BarChart', ['STATISTICAL', 'EXPORT']],
                    ]
                ],
            ];

            foreach ($structure as $pageTitle => $pageData) {
                // Tạo Page (Cấp 1)
                $page = Page::updateOrCreate(
                    ['title' => $pageTitle],
                    ['icon' => $pageData['icon'], 'sort_order' => $pageData['sort']]
                );

                foreach ($pageData['groups'] as $groupName => $groupInfo) {
                    // Tạo GroupPermission gắn vào Page (Cấp 2 - Quan hệ 1-N)
                    $group = GroupPermission::updateOrCreate(
                        ['name' => $groupName],
                        [
                            'page_id' => $page->id,
                            'url'     => $groupInfo[0],
                            'icon'    => $groupInfo[1],
                            'status'  => Status::ACTIVE
                        ]
                    );

                    // Gom Permission lẻ vào Group (Quan hệ N-N)
                    $keywords = $groupInfo[2];
                    $permissionIds = Permission::where(function ($query) use ($keywords) {
                        foreach ($keywords as $keyword) {
                            $query->orWhere('name', 'LIKE', "%{$keyword}%");
                        }
                    })->pluck('id');

                    $group->permissions()->sync($permissionIds);
                }
            }
        });
    }
}