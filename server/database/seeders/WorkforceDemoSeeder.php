<?php

namespace Database\Seeders;

use App\Enums\CheckInStatus;
use App\Enums\LeaveStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WorkforceDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $adminId = DB::table('users')->where('username', 'admin')->value('id');
            $customerId = DB::table('users')->where('username', 'customer_demo')->value('id');

            $staffUsers = DB::table('users')->whereIn('username', ['sale_ft_01', 'sale_pt_01', 'warehouse_01'])->get();
            $shifts = DB::table('shifts')->get()->keyBy('name');

            $morningShift = $shifts->get('Ca Sáng') ?? $shifts->get('Ca Sang') ?? $shifts->first();
            $afternoonShift = $shifts->get('Ca Chiều') ?? $shifts->get('Ca Chieu') ?? $shifts->skip(1)->first() ?? $shifts->first();

            if (!$morningShift || !$afternoonShift) {
                return;
            }

            $today = now()->toDateString();
            $yesterday = now()->subDay()->toDateString();
            $tomorrow = now()->addDay()->toDateString();

            foreach ($staffUsers as $index => $user) {
                $shift = $index % 2 === 0 ? $morningShift : $afternoonShift;

                DB::table('shift_assignments')->updateOrInsert(
                    ['user_id' => $user->id, 'shift_id' => $shift->id, 'date' => $today],
                    ['updated_at' => now(), 'created_at' => now()]
                );

                DB::table('attendances')->updateOrInsert(
                    ['user_id' => $user->id, 'date' => $yesterday],
                    ['check_in' => now()->subDay()->setTime(8, 5, 0), 'check_out' => now()->subDay()->setTime(17, 35, 0), 'is_holiday' => false, 'total_hours' => 8.5, 'status' => CheckInStatus::PRESENT->value, 'shift_id' => $shift->id, 'updated_at' => now(), 'created_at' => now()]
                );

                DB::table('leave_requests')->updateOrInsert(
                    ['user_id' => $user->id, 'shift_id' => $shift->id, 'leave_date' => $tomorrow],
                    ['reason' => 'Demo leave request', 'status' => LeaveStatus::PENDING->value, 'approved_by' => $adminId, 'updated_at' => now(), 'created_at' => now()]
                );
            }

            $positions = DB::table('positions')->get();
            foreach ($positions as $position) {
                DB::table('position_default_schedules')->updateOrInsert(
                    ['position_id' => $position->id, 'day_of_week' => 1, 'shift_id' => $morningShift->id],
                    ['updated_at' => now(), 'created_at' => now()]
                );

                DB::table('position_default_schedules')->updateOrInsert(
                    ['position_id' => $position->id, 'day_of_week' => 5, 'shift_id' => $afternoonShift->id],
                    ['updated_at' => now(), 'created_at' => now()]
                );
            }

            if ($customerId) {
                DB::table('attendances')->updateOrInsert(
                    ['user_id' => $customerId, 'date' => $yesterday],
                    ['check_in' => now()->subDay()->setTime(9, 0, 0), 'check_out' => now()->subDay()->setTime(11, 0, 0), 'is_holiday' => false, 'total_hours' => 2, 'status' => CheckInStatus::OT->value, 'shift_id' => $morningShift->id, 'updated_at' => now(), 'created_at' => now()]
                );
            }
        });
    }
}