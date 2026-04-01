<?php

namespace Database\Seeders;

use App\Enums\Status;
use App\Models\Shift;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $shifts = [
            [
                'name'         => 'Ca Sáng',
                'start_time'   => '07:30:00',
                'end_time'     => '11:30:00',
                'grace_period' => 10,
                'status'       => Status::ACTIVE->value,
            ],
            [
                'name'         => 'Ca Chiều',
                'start_time'   => '13:00:00',
                'end_time'     => '17:00:00',
                'grace_period' => 10,
                'status'       => Status::ACTIVE->value,
            ],
            [
                'name'         => 'Ca Toàn Ngày',
                'start_time'   => '07:30:00',
                'end_time'     => '17:00:00',
                'grace_period' => 15,
                'status'       => Status::ACTIVE->value,
            ],
        ];

        foreach ($shifts as $shift) {
            Shift::updateOrCreate(['name' => $shift['name']], $shift);
        }
    }
}
