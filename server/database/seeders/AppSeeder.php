<?php

namespace Database\Seeders;

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
        $adminRole = Role::where('name', RoleType::ADMIN->value)->first();

        // 2. Tạo tài khoản Admin mặc định
        if ($adminRole) {
            User::updateOrCreate(
                ['username' => 'admin'],
                [
                    'full_name' => 'Admin Manager',
                    'email' => 'lehuuhuy211405@gmail.com',
                    'phone' => '0399097211',
                    'gender' => 'MALE',
                    'password' => Hash::make('admin'),
                    'status' => UserStatus::ACTIVE,
                    'role_id' => $adminRole->id,
                    'user_rank_id' => $highestRank->id ?? null,
                ]
            );
        }
    }
}