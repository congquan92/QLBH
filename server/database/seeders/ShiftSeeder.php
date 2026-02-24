<?php

namespace Database\Seeders;

use App\Models\Shift;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
   public function run(): void
    {
        $shifts = [
            [
                'name' => 'Ca Hành Chính',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'grace_period' => 15, // Đi muộn tối đa 15p
            ],
            [
                'name' => 'Ca Sáng',
                'start_time' => '07:00:00',
                'end_time' => '11:30:00',
                'grace_period' => 10, // Đi muộn tối đa 10p
            ],
            [
                'name' => 'Ca Chiều',
                'start_time' => '13:00:00',
                'end_time' => '17:30:00',
                'grace_period' => 10,
            ],
            // [
            //     'name' => 'Ca Đêm',
            //     'start_time' => '22:00:00',
            //     'end_time' => '06:00:00',
            //     'grace_period' => 5,
            // ]
        ];

        foreach ($shifts as $shift) {
            // Sử dụng updateOrCreate để tránh trùng lặp nếu chạy lại seeder nhiều lần
            Shift::updateOrCreate(
                ['name' => $shift['name']], 
                $shift
            );
        }

        $this->command->info('Đã tạo xong các ca làm việc mẫu!');
    }
}
