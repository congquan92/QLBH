<?php

namespace Database\Seeders;

use App\Models\Holiday;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HolidaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $tetHoliday = [
            ['name' => 'Tết Nguyên Đán (Giao thừa)', 'holiday_date' => '2026-02-16'],
            ['name' => 'Tết Nguyên Đán (Mùng 1)', 'holiday_date' => '2026-02-17'],
            ['name' => 'Tết Nguyên Đán (Mùng 2)', 'holiday_date' => '2026-02-18'],
            ['name' => 'Tết Nguyên Đán (Mùng 3)', 'holiday_date' => '2026-02-19'],
            ['name' => 'Tết Nguyên Đán (Mùng 4)', 'holiday_date' => '2026-02-20'],
            ['name' => 'Ngày Quốc khánh', 'holiday_date' => '2026-09-02'],
        ];

        foreach ($tetHoliday as $day) {
            Holiday::updateOrCreate(['holiday_date' => $day['holiday_date']], $day);
        }
    }
}
