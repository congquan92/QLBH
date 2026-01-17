<?php

namespace Database\Seeders;

use App\Enums\PermissionType;
use App\Enums\Rank;
use App\Enums\RoleType;
use App\Enums\Status;
use App\Enums\UserStatus;
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
            $permission = Permission::firstOrNew(
                ['name' => $perm->value]
            );

            $permission->description = "Permission {$perm->value}";
            $permission->status = Status::ACTIVE->value;
            $permission->save();
        }

        // 2. Tạo Permissions
        foreach (Rank::cases() as $rank) {
            UserRank::updateOrCreate(
                ['name' => $rank->value],
                [
                    'min_spent' => $rank->minSpent(),
                    'status' => Status::ACTIVE,
                ]
            );
        }

        $adminRank = UserRank::where('status', Status::ACTIVE)
            ->orderByDesc('min_spent')
            ->first();


        // 3. Tạo Roles
        foreach (RoleType::cases() as $roleEnum) {
            Role::updateOrCreate(
                ['name' => $roleEnum->value],
                [
                    'description' => $roleEnum->description(),
                    'status' => 'ACTIVE',
                ]
            );
        }

        $adminRole = Role::where('name', RoleType::ADMIN->value)->first();


        // Gắn permissions vào role admin
        $adminRole->permissions()->sync(Permission::all()->pluck('id'));

        // 3. Tạo admin user nếu chưa có
        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'full_name' => 'Admin',
                'email' => 'lehuuhuy211405@gmail.com',
                'phone' => '0399097211',
                'gender' => 'MALE',
                'password' => Hash::make('admin'),
                'status' => UserStatus::ACTIVE,
                'role_id' => $adminRole->id,
                'user_rank_id'=> $adminRank->id,
            ]
        );
    }
}
