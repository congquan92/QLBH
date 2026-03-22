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
        // 1. UserRanks
        foreach (Rank::cases() as $rank) {
            UserRank::updateOrCreate(
                ['name' => $rank->value],
                ['min_spent' => $rank->minSpent(), 'status' => Status::ACTIVE->value]
            );
        }

        $highestRank = UserRank::orderByDesc('min_spent')->first();
        $defaultRank = UserRank::orderBy('min_spent')->first();

        // 2. Tài khoản hệ thống — mật khẩu mạnh hơn, thông tin thực
        $accounts = [
            [
                'username'  => 'admin',
                'full_name' => 'Nguyễn Minh Tuấn',
                'email'     => 'admin@qlbh.vn',
                'phone'     => '0901234567',
                'gender'    => Gender::MALE->value,
                'password'  => 'admin123',
                'role'      => RoleType::ADMIN,
                'rank_id'   => $highestRank?->id,
            ],
            [
                'username'  => 'warehouse_staff',
                'full_name' => 'Trần Văn Long',
                'email'     => 'warehouse@qlbh.vn',
                'phone'     => '0902345678',
                'gender'    => Gender::MALE->value,
                'password'  => 'Staff@2026!',
                'role'      => RoleType::WAREHOUSE_STAFF,
                'rank_id'   => $defaultRank?->id,
            ],
            [
                'username'  => 'order_staff',
                'full_name' => 'Lê Thị Hồng',
                'email'     => 'order@qlbh.vn',
                'phone'     => '0903456789',
                'gender'    => Gender::FEMALE->value,
                'password'  => 'Staff@2026!',
                'role'      => RoleType::ORDER_STAFF,
                'rank_id'   => $defaultRank?->id,
            ],
            // Khách hàng thực với đầy đủ thông tin
            [
                'username'  => 'khach_01',
                'full_name' => 'Phạm Thị Thu',
                'email'     => 'thu.pham@gmail.com',
                'phone'     => '0904567890',
                'gender'    => Gender::FEMALE->value,
                'password'  => 'User@2026!',
                'role'      => RoleType::USER,
                'rank_id'   => $defaultRank?->id,
            ],
            [
                'username'  => 'khach_02',
                'full_name' => 'Nguyễn Văn Bình',
                'email'     => 'binh.nguyen@gmail.com',
                'phone'     => '0905678901',
                'gender'    => Gender::MALE->value,
                'password'  => 'User@2026!',
                'role'      => RoleType::USER,
                'rank_id'   => $defaultRank?->id,
            ],
            [
                'username'  => 'khach_03',
                'full_name' => 'Hoàng Thị Lan',
                'email'     => 'lan.hoang@gmail.com',
                'phone'     => '0906789012',
                'gender'    => Gender::FEMALE->value,
                'password'  => 'User@2026!',
                'role'      => RoleType::USER,
                'rank_id'   => $defaultRank?->id,
            ],
        ];

        foreach ($accounts as $data) {
            $role = Role::where('name', $data['role']->value)->first();
            if (!$role) continue;

            User::updateOrCreate(
                ['username' => $data['username']],
                [
                    'full_name'    => $data['full_name'],
                    'email'        => $data['email'],
                    'phone'        => $data['phone'],
                    'gender'       => $data['gender'],
                    'password'     => Hash::make($data['password']),
                    'status'       => UserStatus::ACTIVE,
                    'role_id'      => $role->id,
                    'user_rank_id' => $data['rank_id'],
                ]
            );
        }
    }
}