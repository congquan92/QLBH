<?php

namespace Database\Seeders;

use App\Enums\Gender;
use App\Models\JobHistory;
use App\Models\Position;
use App\Models\SalaryScale;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class PositionSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create(); // Khởi tạo đối tượng Faker

        $defaultRankId = DB::table('user_ranks')->first()?->id ?? 1;
        $defaultRole = DB::table('roles')->where('name', 'ORDER_STAFF')->first();
        $defaultRoleId = $defaultRole ? $defaultRole->id : 1;

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
                $user = User::create([
                    'full_name'    => $faker->name(), // Đổi thành $faker
                    'username'     => $faker->unique()->userName(),
                    'email'        => $faker->unique()->safeEmail(),
                    'password'     => Hash::make('password'),
                    'phone'        => '09' . $faker->numerify('########'),
                    'status'       => 'ACTIVE',
                    'gender'       => $faker->randomElement([Gender::MALE, Gender::FEMALE]),
                    'position_id'  => $position->id,
                    'user_rank_id' => $defaultRankId,
                    'role_id'      => $defaultRoleId,
                    'created_at'   => now(),
                ]);

                $startingSalary = $position->base_salary * $coefficient;

                JobHistory::create([
                    'user_id'         => $user->id,
                    'position_id'     => $position->id,
                    'current_salary'  => $startingSalary,
                    'employment_type' => str_contains($position->name, 'Full-time') ? 'FULL_TIME' : 'PART_TIME',
                    'effective_date'  => Carbon::now()->startOfMonth(),
                    'end_date'        => null,
                ]);
            }
        }
    }
}