<?php

namespace Database\Seeders;

use App\Enums\EmploymentType;
use App\Enums\Gender;
use App\Enums\UserStatus;
use App\Models\JobHistory;
use App\Models\Position;
use App\Models\SalaryScale;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PositionSeeder extends Seeder
{
    public function run(): void
    {
        $defaultRankId = DB::table('user_ranks')->orderBy('min_spent')->first()?->id ?? 1;

        // Lấy hệ số lương theo năm kinh nghiệm
        $getCoefficient = fn(int $years) =>
            SalaryScale::where('years_of_experience', '<=', $years)
                ->orderByDesc('years_of_experience')
                ->value('coefficient') ?? 1.0;

        $roleMap = DB::table('roles')
            ->whereIn('name', ['ORDER_STAFF', 'WAREHOUSE_STAFF', 'ADMIN'])
            ->pluck('id', 'name');

        // --- Định nghĩa vị trí ---
        $positions = [
            [
                'name'        => 'Thử việc',
                'base_salary' => 7_000_000,
                'salary_type' => 'MONTHLY',
            ],
            [
                'name'        => 'Nhân viên bán hàng',
                'base_salary' => 9_000_000,
                'salary_type' => 'MONTHLY',
            ],
            [
                'name'        => 'Nhân viên(Part-Time)',
                'base_salary' => 30000,
                'salary_type' => 'HOURLY',
            ],
            [
                'name'        => 'Nhân viên kho',
                'base_salary' => 8_500_000,
                'salary_type' => 'MONTHLY',
            ],
            [
                'name'        => 'Nhóm trưởng',
                'base_salary' => 12_000_000,
                'salary_type' => 'MONTHLY',
            ],
            [
                'name'        => 'Quản lý',
                'base_salary' => 18_000_000,
                'salary_type' => 'MONTHLY',
            ],
            [
                'name'        => 'Quản trị viên',
                'base_salary' => 30_000_000,
                'salary_type' => 'MONTHLY',
            ],
        ];

        foreach ($positions as $pos) {
            Position::updateOrCreate(
                ['name' => $pos['name']],
                ['base_salary' => $pos['base_salary'], 'salary_type' => $pos['salary_type']]
            );
        }

        // --- Gán admin vào vị trí Quản trị viên ---
        $adminPosition = Position::where('name', 'Quản trị viên')->first();
        $adminUser     = User::where('username', 'admin')->first();
        if ($adminUser && $adminPosition) {
            $adminUser->update(['position_id' => $adminPosition->id]);
            JobHistory::updateOrCreate(
                ['user_id' => $adminUser->id, 'position_id' => $adminPosition->id],
                [
                    'current_salary'  => $adminPosition->base_salary * $getCoefficient(5),
                    'employment_type' => 'FULL_TIME',
                    'effective_date'  => Carbon::now()->subYears(5)->startOfMonth(),
                    'end_date'        => null,
                ]
            );
        }

        // --- Gán warehouse_staff & order_staff sang PositionSeeder ---
        $warehouseUser  = User::where('username', 'warehouse_staff')->first();
        $warehousePos   = Position::where('name', 'Nhân viên kho')->first();
        if ($warehouseUser && $warehousePos) {
            $warehouseUser->update(['position_id' => $warehousePos->id]);
            JobHistory::updateOrCreate(
                ['user_id' => $warehouseUser->id, 'position_id' => $warehousePos->id],
                [
                    'current_salary'  => $warehousePos->base_salary * $getCoefficient(2),
                    'employment_type' => 'FULL_TIME',
                    'effective_date'  => Carbon::now()->subYears(2)->startOfMonth(),
                    'end_date'        => null,
                ]
            );
        }

        $orderUser = User::where('username', 'order_staff')->first();
        $orderPos  = Position::where('name', 'Nhân viên bán hàng')->first();
        if ($orderUser && $orderPos) {
            $orderUser->update(['position_id' => $orderPos->id]);
            JobHistory::updateOrCreate(
                ['user_id' => $orderUser->id, 'position_id' => $orderPos->id],
                [
                    'current_salary'  => $orderPos->base_salary * $getCoefficient(1),
                    'employment_type' => 'FULL_TIME',
                    'effective_date'  => Carbon::now()->subYear()->startOfMonth(),
                    'end_date'        => null,
                ]
            );
        }

        // --- Nhân viên phòng bán hàng ---
        $salesStaff = [
            [
                'username'        => 'nv_banhang_01',
                'full_name'       => 'Nguyễn Văn An',
                'email'           => 'an.nguyen@qlbh.vn',
                'phone'           => '0911000001',
                'gender'          => Gender::MALE,
                'role'            => 'ORDER_STAFF',
                'position'        => 'Nhân viên bán hàng',
                'employment_type' => 'FULL_TIME',
                'years_exp'       => 1,
            ],
            [
                'username'        => 'nv_banhang_02',
                'full_name'       => 'Trần Thị Bích Ngọc',
                'email'           => 'ngoc.tran@qlbh.vn',
                'phone'           => '0911000002',
                'gender'          => Gender::FEMALE,
                'role'            => 'ORDER_STAFF',
                'position'        => 'Nhân viên bán hàng',
                'employment_type' => 'PART_TIME',
                'years_exp'       => 0,
            ],
            [
                'username'        => 'nv_banhang_03',
                'full_name'       => 'Lê Minh Khang',
                'email'           => 'khang.le@qlbh.vn',
                'phone'           => '0911000003',
                'gender'          => Gender::MALE,
                'role'            => 'ORDER_STAFF',
                'position'        => 'Nhân viên bán hàng',
                'employment_type' => 'FULL_TIME',
                'years_exp'       => 2,
            ],
        ];

        // --- Nhân viên kho ---
        $warehouseStaff = [
            [
                'username'        => 'nv_kho_01',
                'full_name'       => 'Phạm Văn Kho',
                'email'           => 'kho.pham@qlbh.vn',
                'phone'           => '0911000006',
                'gender'          => Gender::MALE,
                'role'            => 'WAREHOUSE_STAFF',
                'position'        => 'Nhân viên kho',
                'employment_type' => 'FULL_TIME',
                'years_exp'       => 3,
            ],
            [
                'username'        => 'nv_kho_02',
                'full_name'       => 'Đinh Thị Ánh',
                'email'           => 'anh.dinh@qlbh.vn',
                'phone'           => '0911000007',
                'gender'          => Gender::FEMALE,
                'role'            => 'WAREHOUSE_STAFF',
                'position'        => 'Nhân viên kho',
                'employment_type' => 'FULL_TIME',
                'years_exp'       => 1,
            ],
        ];

        // --- Quản lý ---
        $managers = [
            [
                'username'        => 'quan_ly_01',
                'full_name'       => 'Phạm Văn Đức',
                'email'           => 'duc.pham@qlbh.vn',
                'phone'           => '0911000004',
                'gender'          => Gender::MALE,
                'role'            => 'ADMIN',
                'position'        => 'Quản lý',
                'employment_type' => 'FULL_TIME',
                'years_exp'       => 5,
            ],
        ];

        // --- Nhóm trưởng (thử việc lâu ngày lên) ---
        $teamLeads = [
            [
                'username'        => 'nhom_truong_01',
                'full_name'       => 'Trần Văn Hòa',
                'email'           => 'hoa.tran@qlbh.vn',
                'phone'           => '0911000005',
                'gender'          => Gender::MALE,
                'role'            => 'ORDER_STAFF',
                'position'        => 'Nhóm trưởng',
                'employment_type' => 'FULL_TIME',
                'years_exp'       => 3,
            ],
        ];

        $allStaff = array_merge($salesStaff, $warehouseStaff, $managers, $teamLeads);

        foreach ($allStaff as $data) {
            $roleId    = $roleMap[$data['role']] ?? null;
            $position  = Position::where('name', $data['position'])->first();
            if (!$roleId || !$position) continue;

            $user = User::updateOrCreate(
                ['username' => $data['username']],
                [
                    'full_name'    => $data['full_name'],
                    'email'        => $data['email'],
                    'password'     => Hash::make('Staff@2026!'),
                    'phone'        => $data['phone'],
                    'status'       => UserStatus::ACTIVE,
                    'gender'       => $data['gender'],
                    'position_id'  => $position->id,
                    'user_rank_id' => $defaultRankId,
                    'role_id'      => $roleId,
                ]
            );

            $coefficient    = $getCoefficient($data['years_exp']);
            $startingSalary = $position->base_salary * $coefficient;
            $effectiveDate  = Carbon::now()->subYears($data['years_exp'])->startOfMonth();

            JobHistory::updateOrCreate(
                ['user_id' => $user->id, 'position_id' => $position->id],
                [
                    'current_salary'  => $startingSalary,
                    'employment_type' => $data['employment_type'],
                    'effective_date'  => $effectiveDate,
                    'end_date'        => null,
                ]
            );
        }
    }
}