<?php

namespace Database\Seeders;

use App\Enums\CheckInStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * WorkforceSeeder — gán lịch làm việc mặc định cho các vị trí và tạo lịch sử chấm công thực tế.
 */
class WorkforceSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->seedPositionDefaultSchedules();
            $this->seedAttendances();
        });
    }

    /**
     * Gán ca mặc định cho từng vị trí.
     */
    private function seedPositionDefaultSchedules(): void
    {
        $morningShift  = DB::table('shifts')->where('name', 'Ca Sáng')->first();
        $afternoonShift = DB::table('shifts')->where('name', 'Ca Chiều')->first();
        $fullDayShift  = DB::table('shifts')->where('name', 'Ca Toàn Ngày')->first();

        if (!$morningShift || !$afternoonShift || !$fullDayShift) {
            return;
        }

        // Position → [day_of_week (1=Mon..7=Sun) → shift]
        $positionSchedules = [
            'Nhân viên bán hàng' => [
                // T2-T6 Ca Sáng, T7 Ca Chiều
                1 => $morningShift->id,
                2 => $morningShift->id,
                3 => $morningShift->id,
                4 => $morningShift->id,
                5 => $morningShift->id,
                6 => $afternoonShift->id,
            ],
            'Nhân viên kho' => [
                1 => $fullDayShift->id,
                2 => $fullDayShift->id,
                3 => $fullDayShift->id,
                4 => $fullDayShift->id,
                5 => $fullDayShift->id,
            ],
            'Nhóm trưởng' => [
                1 => $fullDayShift->id,
                2 => $fullDayShift->id,
                3 => $fullDayShift->id,
                4 => $fullDayShift->id,
                5 => $fullDayShift->id,
                6 => $morningShift->id,
            ],
            'Quản lý' => [
                1 => $fullDayShift->id,
                2 => $fullDayShift->id,
                3 => $fullDayShift->id,
                4 => $fullDayShift->id,
                5 => $fullDayShift->id,
            ],
            'Quản trị viên' => [
                1 => $fullDayShift->id,
                2 => $fullDayShift->id,
                3 => $fullDayShift->id,
                4 => $fullDayShift->id,
                5 => $fullDayShift->id,
            ],
            'Thử việc' => [
                1 => $morningShift->id,
                2 => $morningShift->id,
                3 => $morningShift->id,
                4 => $morningShift->id,
                5 => $morningShift->id,
            ],
        ];

        foreach ($positionSchedules as $positionName => $schedule) {
            $positionId = DB::table('positions')->where('name', $positionName)->value('id');
            if (!$positionId) continue;

            foreach ($schedule as $dayOfWeek => $shiftId) {
                DB::table('position_default_schedules')->updateOrInsert(
                    ['position_id' => $positionId, 'day_of_week' => $dayOfWeek],
                    ['shift_id' => $shiftId, 'updated_at' => now(), 'created_at' => now()]
                );
            }
        }
    }

    /**
     * Tạo lịch sử chấm công cho tháng hiện tại.
     */
    private function seedAttendances(): void
    {
        // Lấy tất cả nhân viên có job_history
        $employees = DB::table('users')
            ->join('roles', 'roles.id', '=', 'users.role_id')
            ->where('roles.name', '!=', 'USER')
            ->select('users.id', 'users.position_id')
            ->get();

        $today     = Carbon::today();
        $startDate = $today->copy()->startOfMonth();
        $holidays  = DB::table('holidays')
            ->whereYear('holiday_date', $today->year)
            ->whereMonth('holiday_date', $today->month)
            ->pluck('holiday_date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->toArray();

        foreach ($employees as $emp) {
            // Lấy ca làm của vị trí
            $defaultShifts = DB::table('position_default_schedules')
                ->where('position_id', $emp->position_id)
                ->pluck('shift_id', 'day_of_week');

            if ($defaultShifts->isEmpty()) continue;

            $date = $startDate->copy();
            while ($date->lt($today)) {
                $dayOfWeek = $date->dayOfWeek === 0 ? 7 : $date->dayOfWeek; // Carbon: 0=Sun

                $shiftId = $defaultShifts[$dayOfWeek] ?? null;
                if (!$shiftId) {
                    $date->addDay();
                    continue;
                }

                $shift     = DB::table('shifts')->find($shiftId);
                $isHoliday = in_array($date->toDateString(), $holidays);

                // 90% đi làm, 10% vắng
                $present = rand(1, 10) <= 9;

                if (!$present) {
                    $date->addDay();
                    continue;
                }

                $startTime = Carbon::parse($date->toDateString() . ' ' . $shift->start_time);
                $endTime   = Carbon::parse($date->toDateString() . ' ' . $shift->end_time);

                // Random trễ 0-15 phút
                $lateMinutes = rand(0, 15);
                $checkIn     = $startTime->copy()->addMinutes($lateMinutes);
                $checkOut    = $endTime->copy()->addMinutes(rand(0, 20));

                $totalHours  = round($checkIn->diffInMinutes($checkOut) / 60, 2);
                $isLate      = $lateMinutes > ($shift->grace_period ?? 10);
                $status      = $isLate ? CheckInStatus::LATE : CheckInStatus::PRESENT;

                DB::table('attendances')->updateOrInsert(
                    ['user_id' => $emp->id, 'date' => $date->toDateString()],
                    [
                        'check_in'    => $checkIn,
                        'check_out'   => $checkOut,
                        'is_holiday'  => $isHoliday,
                        'total_hours' => $totalHours,
                        'status'      => $status->value,
                        'shift_id'    => $shiftId,
                        'updated_at'  => now(),
                        'created_at'  => now(),
                    ]
                );

                $date->addDay();
            }
        }
    }
}
