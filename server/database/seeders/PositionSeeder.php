<?php

namespace Database\Seeders;

use App\Enums\EmploymentType;
use App\Enums\Gender;
use App\Enums\RoleType;
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
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultRankId = DB::table('user_ranks')->orderBy('id')->value('id');
        $defaultOrderRoleId = DB::table('roles')->where('name', RoleType::ORDER_STAFF->value)->value('id');
        $defaultWarehouseRoleId = DB::table('roles')->where('name', RoleType::WAREHOUSE_STAFF->value)->value('id');
        $defaultAdminRoleId = DB::table('roles')->where('name', RoleType::ADMIN->value)->value('id');

        $defaultScale = SalaryScale::where('years_of_experience', 0)->first();
        $coefficient = $defaultScale ? $defaultScale->coefficient : 1.0;

        $positions = [
            [
                'name' => 'Nhân viên Bán hàng (Full-time)',
                'base_salary' => 7000000,
                'salary_type' => 'MONTHLY',
                'employee_role_id' => $defaultOrderRoleId,
                'employment_type' => EmploymentType::FULLTIME->value,
                'samples' => [
                    ['username' => 'sale_ft_01', 'full_name' => 'Sales FT 01', 'email' => 'sale.ft01@qlbh.local', 'gender' => Gender::MALE->value],
                    ['username' => 'sale_ft_02', 'full_name' => 'Sales FT 02', 'email' => 'sale.ft02@qlbh.local', 'gender' => Gender::FEMALE->value],
                ],
            ],
            [
                'name' => 'Nhân viên Bán hàng (Part-time)',
                'base_salary' => 25000,
                'salary_type' => 'HOURLY',
                'employee_role_id' => $defaultOrderRoleId,
                'employment_type' => EmploymentType::PARTTIME->value,
                'samples' => [
                    ['username' => 'sale_pt_01', 'full_name' => 'Sales PT 01', 'email' => 'sale.pt01@qlbh.local', 'gender' => Gender::FEMALE->value],
                    ['username' => 'sale_pt_02', 'full_name' => 'Sales PT 02', 'email' => 'sale.pt02@qlbh.local', 'gender' => Gender::MALE->value],
                ],
            ],
            [
                'name' => 'Quản lý kho',
                'base_salary' => 10000000,
                'salary_type' => 'MONTHLY',
                'employee_role_id' => $defaultWarehouseRoleId,
                'employment_type' => EmploymentType::FULLTIME->value,
                'samples' => [
                    ['username' => 'warehouse_01', 'full_name' => 'Warehouse 01', 'email' => 'warehouse01@qlbh.local', 'gender' => Gender::MALE->value],
                ],
            ],
            [
                'name' => 'Quản trị viên',
                'base_salary' => 30000000,
                'salary_type' => 'MONTHLY',
                'employee_role_id' => $defaultAdminRoleId,
                'employment_type' => EmploymentType::FULLTIME->value,
                'samples' => [
                    ['username' => 'hr_admin_01', 'full_name' => 'HR Admin 01', 'email' => 'hr.admin01@qlbh.local', 'gender' => Gender::FEMALE->value],
                ],
            ],
        ];

        foreach ($positions as $pos) {
            $position = Position::updateOrCreate(
                ['name' => $pos['name']],
                [
                    'base_salary' => $pos['base_salary'],
                    'salary_type' => $pos['salary_type'],
                ]
            );

            foreach ($pos['samples'] as $index => $sampleUser) {
                $user = User::updateOrCreate(
                    ['username' => $sampleUser['username']],
                    [
                        'full_name' => $sampleUser['full_name'],
                        'email' => $sampleUser['email'],
                        'password' => Hash::make('password123'),
                        'phone' => '09120000' . str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                        'status' => UserStatus::ACTIVE,
                        'gender' => $sampleUser['gender'],
                        'position_id' => $position->id,
                        'user_rank_id' => $defaultRankId,
                        'role_id' => $pos['employee_role_id'] ?? $defaultOrderRoleId,
                    ]
                );

                $startingSalary = $position->base_salary * $coefficient;
                $effectiveDate = Carbon::now()->startOfMonth()->toDateString();

                JobHistory::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'position_id' => $position->id,
                        'effective_date' => $effectiveDate,
                    ],
                    [
                        'current_salary' => $startingSalary,
                        'employment_type' => $pos['employment_type'],
                        'end_date' => null,
                    ]
                );
            }
        }
    }
}
