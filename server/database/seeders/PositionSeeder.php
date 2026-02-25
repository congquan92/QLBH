<?php

namespace Database\Seeders;

use App\Enums\Gender;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultRankId = \DB::table('user_ranks')->first()?->id ?? 1;
        $defaultRoleId = \DB::table('roles')->where('name', 'ORDER_STAFF')->first()?->id
            ?? \DB::table('roles')->first()?->id
            ?? 1;
        // 1. Danh sách các chức vụ thực tế trong shop quần áo
        $positions = [
            // Nhóm Bán hàng
            [
                'name' => 'Nhân viên Bán hàng (Full-time)',
                'base_salary' => 7000000,
                'salary_type' => 'MONTHLY'
            ],
            [
                'name' => 'Nhân viên Bán hàng (Part-time)',
                'base_salary' => 25000,
                'salary_type' => 'HOURLY'
            ],
            // Nhóm Kho
            [
                'name' => 'Quản lý kho',
                'base_salary' => 10000000,
                'salary_type' => 'MONTHLY'
            ],
            [
                'name' => 'Nhân viên kiểm kho',
                'base_salary' => 30000,
                'salary_type' => 'HOURLY'
            ]
        ];

        foreach ($positions as $pos) {
            $position = Position::create($pos);

            // 2. Tạo 15 nhân viên ảo cho mỗi chức vụ để test Phân trang (Pagination)
            for ($i = 1; $i <= 5; $i++) {
                User::create([
                    'full_name' => fake()->name(),
                    'username' => fake()->unique()->userName(),
                    'email' => fake()->unique()->safeEmail(),
                    'password' => Hash::make('password'),
                    'phone' => fake()->phoneNumber(),
                    'status' => 'ACTIVE',
                    'gender' => Gender::OTHER,
                    'position_id' => $position->id,
                    'user_rank_id' => $defaultRankId,
                    'role_id' => $defaultRoleId,
                ]);
            }
        }
    }
}
