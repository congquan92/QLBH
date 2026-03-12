<?php

namespace Database\Seeders;

use App\Enums\Gender;
use App\Enums\Rank;
use App\Enums\RoleType;
use App\Enums\Status;
use App\Enums\UserStatus;
use App\Models\UserRank;
use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
class AppSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Tạo UserRank
        foreach (Rank::cases() as $rank) {
            UserRank::updateOrCreate(
                ['name' => $rank->value],
                [
                    'min_spent' => $rank->minSpent(),
                    'status' => Status::ACTIVE->value,
                ]
            );
        }

        $highestRank = UserRank::orderByDesc('min_spent')->first();
        $defaultRank = UserRank::orderBy('min_spent')->first();

        // 2. Tạo các tài khoản mẫu cố định để test nhanh
        $demoUsers = [
            [
                'username' => 'admin',
                'full_name' => 'System Admin',
                'email' => 'admin@qlbh.local',
                'phone' => '0900000001',
                'gender' => Gender::MALE->value,
                'password' => 'admin123',
                'role' => RoleType::ADMIN,
                'rank_id' => $highestRank?->id,
            ],
            [
                'username' => 'warehouse_staff',
                'full_name' => 'Warehouse Staff',
                'email' => 'warehouse@qlbh.local',
                'phone' => '0900000002',
                'gender' => Gender::FEMALE->value,
                'password' => 'staff123',
                'role' => RoleType::WAREHOUSE_STAFF,
                'rank_id' => $defaultRank?->id,
            ],
            [
                'username' => 'order_staff',
                'full_name' => 'Order Staff',
                'email' => 'order@qlbh.local',
                'phone' => '0900000003',
                'gender' => Gender::MALE->value,
                'password' => 'staff123',
                'role' => RoleType::ORDER_STAFF,
                'rank_id' => $defaultRank?->id,
            ],
            [
                'username' => 'customer_demo',
                'full_name' => 'Customer Demo',
                'email' => 'customer@qlbh.local',
                'phone' => '0900000004',
                'gender' => Gender::FEMALE->value,
                'password' => 'user123',
                'role' => RoleType::USER,
                'rank_id' => $defaultRank?->id,
            ],
        ];

        foreach ($demoUsers as $demoUser) {
            $role = Role::where('name', $demoUser['role']->value)->first();

            if (!$role) {
                continue;
            }

            User::updateOrCreate(
                ['username' => $demoUser['username']],
                [
                    'full_name' => $demoUser['full_name'],
                    'email' => $demoUser['email'],
                    'phone' => $demoUser['phone'],
                    'gender' => $demoUser['gender'],
                    'password' => Hash::make($demoUser['password']),
                    'status' => UserStatus::ACTIVE,
                    'role_id' => $role->id,
                    'user_rank_id' => $demoUser['rank_id'],
                ]
            );
        }
    }
}