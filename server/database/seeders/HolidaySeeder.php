<?php

namespace Database\Seeders;

use App\Models\Holiday;
use Illuminate\Database\Seeder;

class HolidaySeeder extends Seeder
{
    public function run(): void
    {
        $year = now()->year;

        // Ngày lễ Việt Nam theo luật lao động (Điều 112 BLLĐ 2019)
        $holidays = [
            ['name' => 'Tết Dương lịch',                  'holiday_date' => "{$year}-01-01"],
            ['name' => 'Ngày Giải phóng miền Nam',         'holiday_date' => "{$year}-04-30"],
            ['name' => 'Ngày Quốc tế Lao động',            'holiday_date' => "{$year}-05-01"],
            ['name' => 'Ngày Quốc khánh 2/9 (bù)',         'holiday_date' => "{$year}-09-01"],
            ['name' => 'Ngày Quốc khánh 2/9',              'holiday_date' => "{$year}-09-02"],
            // Tết Nguyên Đán 2026 (âm lịch 1/1 ~ dương 19/2)
            ['name' => 'Tết Nguyên Đán (trước)',           'holiday_date' => "{$year}-01-27"],
            ['name' => 'Tết Nguyên Đán (trước)',           'holiday_date' => "{$year}-01-28"],
            ['name' => 'Tết Nguyên Đán (Mùng 1)',          'holiday_date' => "{$year}-01-29"],
            ['name' => 'Tết Nguyên Đán (Mùng 2)',          'holiday_date' => "{$year}-01-30"],
            ['name' => 'Tết Nguyên Đán (Mùng 3)',          'holiday_date' => "{$year}-01-31"],
            ['name' => 'Tết Nguyên Đán (Mùng 4)',          'holiday_date' => "{$year}-02-01"],
            ['name' => 'Tết Nguyên Đán (Mùng 5)',          'holiday_date' => "{$year}-02-02"],
            // Giỗ Tổ Hùng Vương (10/3 âm ~ 7/4 dl 2026)
            ['name' => 'Giỗ Tổ Hùng Vương',               'holiday_date' => "{$year}-04-07"],
        ];

        foreach ($holidays as $day) {
            Holiday::updateOrCreate(
                ['holiday_date' => $day['holiday_date']],
                ['name' => $day['name']]
            );
        }
    }
}
