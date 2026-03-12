<?php

namespace Database\Seeders;

use App\Models\Holiday;
use Illuminate\Database\Seeder;

class HolidaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $year = now()->year;

        $holidaySamples = [
            ['name' => 'Tết Dương lịch', 'holiday_date' => "{$year}-01-01"],
            ['name' => 'Ngày Giải phóng miền Nam', 'holiday_date' => "{$year}-04-30"],
            ['name' => 'Ngày Quốc tế Lao động', 'holiday_date' => "{$year}-05-01"],
            ['name' => 'Ngày Quốc khánh', 'holiday_date' => "{$year}-09-02"],
            ['name' => 'Giáng sinh', 'holiday_date' => "{$year}-12-25"],
        ];

        foreach ($holidaySamples as $day) {
            Holiday::updateOrCreate(['holiday_date' => $day['holiday_date']], $day);
        }
    }
}
