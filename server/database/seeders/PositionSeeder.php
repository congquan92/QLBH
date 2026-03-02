<?php

namespace Database\Seeders;

use App\Enums\Gender;
use App\Models\JobHistory;
use App\Models\Position;
use App\Models\SalaryScale;
use App\Models\User;
use Carbon\Carbon;
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
        $defaultRoleId = \DB::table('roles')->where('name', 'ORDER_STAFF')->first()?->id ?? 1;

        $defaultScale = SalaryScale::where('years_of_experience', 0)->first();
        $coefficient = $defaultScale ? $defaultScale->coefficient : 1.0;

        $positions = [
            ['name' => 'Nhân viên Bán hàng (Full-time)', 'base_salary' => 7000000, 'salary_type' => 'MONTHLY'],
            ['name' => 'Nhân viên Bán hàng (Part-time)', 'base_salary' => 25000, 'salary_type' => 'HOURLY'],
            ['name' => 'Quản lý kho', 'base_salary' => 10000000, 'salary_type' => 'MONTHLY'],
            ['name' => 'Quản trị viên', 'base_salary' => 30000000, 'salary_type' => 'MONTHLY']
        ];

        foreach ($positions as $pos) {
            $position = Position::create($pos);

            for ($i = 1; $i <= 5; $i++) {
                // 1. Tạo User
                $user = User::create([
                    'full_name' => fake()->name(),
                    'username' => fake()->unique()->userName(),
                    'email' => fake()->unique()->safeEmail(),
                    'password' => Hash::make('password'),
                    'phone' => '09' . fake()->numerify('########'),
                    'status' => 'ACTIVE',
                    'gender' => fake()->randomElement([Gender::MALE, Gender::FEMALE]),
                    'position_id' => $position->id,
                    'user_rank_id' => $defaultRankId,
                    'role_id' => $defaultRoleId,
                    'created_at' => now(),
                ]);
                $startingSalary = $position->base_salary * $coefficient;

                JobHistory::create([
                    'user_id' => $user->id,
                    'position_id' => $position->id,
                    'current_salary' => $startingSalary,
                    'employment_type' => str_contains($position->name, 'Full-time') ? 'FULL_TIME' : 'PART_TIME',
                    'effective_date' => Carbon::now()->startOfMonth(),
                    'end_date' => null,
                ]);
            }
        }
    }
}
