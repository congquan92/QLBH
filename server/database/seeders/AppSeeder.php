<?php

namespace Database\Seeders;

use App\Enums\PermissionType;
use App\Enums\Rank;
use App\Enums\RoleType;
use App\Enums\Status;
use App\Enums\UserStatus;
use App\Models\GroupPermission;
use App\Models\UserRank;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\Hash;

class AppSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Tạo Permissions
        foreach (PermissionType::cases() as $perm) {
            Permission::updateOrCreate(
                ['name' => $perm->value],
                [
                    'description' => "Quyền {$perm->value}",
                    'status' => Status::ACTIVE->value,
                ]
            );
        }

        // 2. Tạo GroupPermissions dựa trên từ khóa trong PermissionType
        // Định nghĩa các nhóm và từ khóa nhận diện
        $groupsConfig = [
            'Quản lý Danh mục' => ['CATEGORIES'],
            'Quản lý Sản phẩm' => ['PRODUCT', 'IMAGE_PRODUCT', 'VARIANT', 'ATTRIBUTE'],
            'Quản lý Đơn hàng' => ['ORDER', 'SHIP'],
            'Quản lý Người dùng' => ['USER', 'USER_RANK'],
            'Quản lý Nhập kho' => ['IMPORT_PRODUCT'],
            'Quản lý Vai trò' => ['ROLE'],
            'Báo cáo Thống kê' => ['STATISTICAL'],
        ];

        foreach ($groupsConfig as $groupName => $keywords) {
            $group = GroupPermission::updateOrCreate(
                ['name' => $groupName],
                ['status' => Status::ACTIVE->value]
            );

            // Tìm các permission có tên chứa keyword và gắn vào nhóm
            $permissionIds = Permission::where(function ($query) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $query->orWhere('name', 'LIKE', "%{$keyword}%");
                }
            })->pluck('id');

            $group->permissions()->sync($permissionIds);
        }

        // 3. Tạo UserRank
        foreach (Rank::cases() as $rank) {
            UserRank::updateOrCreate(
                ['name' => $rank->value],
                [
                    'min_spent' => $rank->minSpent(),
                    'status' => Status::ACTIVE->value,
                ]
            );
        }

        $adminRank = UserRank::where('status', Status::ACTIVE->value)
            ->orderByDesc('min_spent')
            ->first();

        // 4. Tạo Roles
        foreach (RoleType::cases() as $roleEnum) {
            Role::updateOrCreate(
                ['name' => $roleEnum->value],
                [
                    'description' => $roleEnum->description(),
                    'status' => Status::ACTIVE->value,
                ]
            );
        }

        $adminRole = Role::where('name', RoleType::ADMIN->value)->first();

        // 5. Gán TẤT CẢ các GroupPermission vào Admin Role
        $allGroupIds = GroupPermission::pluck('id');
        $adminRole->groupPermissions()->sync($allGroupIds);

        // 6. Tạo admin user
        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'full_name' => 'Admin Manager',
                'email' => 'lehuuhuy211405@gmail.com',
                'phone' => '0399097211',
                'gender' => 'MALE',
                'password' => Hash::make('admin'),
                'status' => UserStatus::ACTIVE,
                'role_id' => $adminRole->id,
                'user_rank_id' => $adminRank->id,
            ]
        );
    }
}
