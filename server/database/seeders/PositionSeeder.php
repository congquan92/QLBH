<?php

namespace Database\Seeders;

use App\Enums\Gender;
use App\Enums\UserStatus;
use App\Models\JobHistory;
use App\Models\Position;
use App\Models\SalaryScale;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class PositionSeeder extends Seeder
{
    public function run(): void
    {
        $defaultRankId = DB::table('user_ranks')->orderBy('min_spent')->first()?->id ?? 1;
        $highestRankId = DB::table('user_ranks')->orderByDesc('min_spent')->first()?->id ?? 1;

        $defaultScale = SalaryScale::where('years_of_experience', 0)->first();
        $coefficient  = $defaultScale ? $defaultScale->coefficient : 1.0;

        $roleMap = DB::table('roles')->whereIn('name', ['ORDER_STAFF', 'WAREHOUSE_STAFF', 'ADMIN'])
            ->pluck('id', 'name');

        $positions = [
            ['name' => 'Thử việc', 'base_salary' => 7000000,  'salary_type' => 'MONTHLY'],
            ['name' => 'Nhân viên', 'base_salary' => 25000,     'salary_type' => 'HOURLY'],
            ['name' => 'Quản lý',                    'base_salary' => 10000000,  'salary_type' => 'MONTHLY'],
            ['name' => 'Quản trị viên',                  'base_salary' => 30000000,  'salary_type' => 'MONTHLY'],
        ];

        // Named staff per position so WorkforceDemoSeeder can find them by username
        $staffByPosition = [
            'Thử việc' => [
                ['username' => 'intern_01', 'full_name' => 'Trần Văn Hòa', 'email' => 'intern_01@qlbh.local', 'phone' => '0911000005', 'gender' => Gender::MALE, 'role' => 'ORDER_STAFF', 'rank_id' => $defaultRankId, 'employment_type' => 'FULL_TIME'],
            ],
            'Nhân viên' => [
                ['username' => 'staff_01', 'full_name' => 'Nguyễn Văn An',  'email' => 'staff_01@qlbh.local', 'phone' => '0911000001', 'gender' => Gender::MALE,   'role' => 'ORDER_STAFF',     'rank_id' => $defaultRankId, 'employment_type' => 'FULL_TIME'],
                ['username' => 'sale_ft_01', 'full_name' => 'Lê Minh Khang',  'email' => 'sale_ft_01@qlbh.local', 'phone' => '0911000002', 'gender' => Gender::MALE,   'role' => 'ORDER_STAFF',     'rank_id' => $defaultRankId, 'employment_type' => 'FULL_TIME'],
                ['username' => 'sale_pt_01', 'full_name' => 'Trần Thị Bình', 'email' => 'sale_pt_01@qlbh.local', 'phone' => '0911000003', 'gender' => Gender::FEMALE, 'role' => 'ORDER_STAFF',     'rank_id' => $defaultRankId, 'employment_type' => 'PART_TIME'],
                ['username' => 'warehouse_01', 'full_name' => 'Phạm Văn Kho',  'email' => 'warehouse_01@qlbh.local', 'phone' => '0911000006', 'gender' => Gender::MALE,   'role' => 'WAREHOUSE_STAFF', 'rank_id' => $defaultRankId, 'employment_type' => 'FULL_TIME'],
            ],
            'Quản lý' => [
                ['username' => 'manager_01', 'full_name' => 'Phạm Văn Đức', 'email' => 'manager_01@qlbh.local', 'phone' => '0911000004', 'gender' => Gender::MALE, 'role' => 'ADMIN', 'rank_id' => $defaultRankId, 'employment_type' => 'FULL_TIME'],
            ],
            'Quản trị viên' => [], // admin đã được tạo trong AppSeeder
        ];

        foreach ($positions as $pos) {
            $position = Position::updateOrCreate(
                ['name' => $pos['name']],
                ['base_salary' => $pos['base_salary'], 'salary_type' => $pos['salary_type']]
            );

            $startingSalary = $position->base_salary * $coefficient;

            // Gán position_id cho admin
            if ($pos['name'] === 'Quản trị viên') {
                User::where('username', 'admin')->update(['position_id' => $position->id]);
                $adminUser = User::where('username', 'admin')->first();
                if ($adminUser) {
                    JobHistory::updateOrCreate(
                        ['user_id' => $adminUser->id, 'position_id' => $position->id],
                        ['current_salary' => $startingSalary, 'employment_type' => 'FULL_TIME', 'effective_date' => Carbon::now()->startOfMonth(), 'end_date' => null]
                    );
                }
                continue;
            }

            foreach ($staffByPosition[$pos['name']] ?? [] as $staffData) {
                $roleId = $roleMap[$staffData['role']] ?? null;
                if (!$roleId) {
                    continue;
                }

                $user = User::updateOrCreate(
                    ['username' => $staffData['username']],
                    [
                        'full_name'    => $staffData['full_name'],
                        'email'        => $staffData['email'],
                        'password'     => Hash::make('staff123'),
                        'phone'        => $staffData['phone'],
                        'status'       => UserStatus::ACTIVE,
                        'gender'       => $staffData['gender'],
                        'position_id'  => $position->id,
                        'user_rank_id' => $staffData['rank_id'],
                        'role_id'      => $roleId,
                    ]
                );

                JobHistory::updateOrCreate(
                    ['user_id' => $user->id, 'position_id' => $position->id],
                    ['current_salary' => $startingSalary, 'employment_type' => $staffData['employment_type'], 'effective_date' => Carbon::now()->startOfMonth(), 'end_date' => null]
                );
            }
        }
    }
}