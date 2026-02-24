<?php
namespace App\Services;

use App\Enums\LeaveStatus;
use App\Models\LeaveRequest;
use App\Models\Shift;
use App\Models\User;
use App\Models\ShiftAssignment;
use App\Models\PositionDefaultSchedule;
use Carbon\Carbon;
use Exception;

class ScheduleService
{
    /**
     * Lấy lịch làm việc của một nhân viên trong một khoảng ngày (Tuần)
     */
    public function getEmployeeWeeklySchedule(User $user, $startDate)
    {
        $start = Carbon::parse($startDate)->startOfWeek();
        $end = Carbon::parse($startDate)->endOfWeek();
        $schedule = [];

        // Lấy tất cả ca đặc biệt trong tuần này
        $assignments = ShiftAssignment::where('user_id', $user->id)
            ->whereBetween('date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->with('shift')
            ->get()
            ->keyBy('date');

        // Lấy lịch mặc định của chức vụ
        $defaultSchedules = PositionDefaultSchedule::where('position_id', $user->position_id)
            ->with('shift')
            ->get()
            ->keyBy('day_of_week');

        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $dateStr = $date->format('Y-m-d');
            $dayOfWeek = $date->dayOfWeek;

            $shift = null;
            $type = 'Nghỉ';

            if (isset($assignments[$dateStr])) {
                $shift = $assignments[$dateStr]->shift;
                $type = 'Ca đặc biệt';
            } elseif (isset($defaultSchedules[$dayOfWeek])) {
                $shift = $defaultSchedules[$dayOfWeek]->shift;
                $type = 'Mặc định';
            }

            $schedule[] = [
                'date' => $dateStr,
                'day_name' => $date->translatedFormat('l'),
                'shift_name' => $shift?->name ?? 'Nghỉ',
                'time' => $shift ? "{$shift->start_time} - {$shift->end_time}" : '-',
                'type' => $type
            ];
        }

        return $schedule;
    }

    /**
     * Xem toàn bộ nhân viên làm việc trong một ngày cụ thể
     */
    public function getAllStaffScheduleByDate($date)
    {
        $targetDate = Carbon::parse($date);
        $dayOfWeek = $targetDate->dayOfWeek;

        $users = User::with(['position'])->where('status', 'ACTIVE')->get();

        $specialShifts = ShiftAssignment::where('date', $targetDate->format('Y-m-d'))
            ->with('shift')->get()->keyBy('user_id');

        $defaultShifts = PositionDefaultSchedule::where('day_of_week', $dayOfWeek)
            ->with('shift')->get()->groupBy('position_id');

        return $users->map(function ($user) use ($specialShifts, $defaultShifts) {
            $shift = null;

            if (isset($specialShifts[$user->id])) {
                $shift = $specialShifts[$user->id]->shift;
            } else {
                $posSchedules = $defaultShifts->get($user->position_id);
                $shift = $posSchedules ? $posSchedules->first()->shift : null;
            }

            return [
                'name' => $user->full_name,
                'position' => $user->position->name ?? 'N/A',
                'shift' => $shift?->id ?? null,
                'start' => $shift?->start_time ?? '-',
                'end' => $shift?->end_time ?? '-',
            ];
        })->filter(fn($item) => $item['shift'] !== 'Nghỉ'); // Chỉ lấy những người có làm
    }

    public function assignShift($data)
    {
        $userId = $data['user_id'];
        $date = $data['date'];
        $newShift = Shift::findOrFail($data['shift_id']);

        $existingAssignments = ShiftAssignment::where('user_id', $userId)
            ->where('date', $date)
            ->with('shift')
            ->get();

        foreach ($existingAssignments as $assignment) {
            $old = $assignment->shift;

            $isOverlapping = ($newShift->start_time < $old->end_time) &&
                ($newShift->end_time > $old->start_time);

            if ($isOverlapping) {
                throw new Exception(
                    "Trùng lịch! Khung giờ {$newShift->start_time}-{$newShift->end_time} " .
                    "đã bị chồng lấn bởi ca '{$old->name}' ({$old->start_time}-{$old->end_time})."
                );
            }
        }

        return ShiftAssignment::create([
            'user_id' => $userId,
            'shift_id' => $newShift->id,
            'date' => $date
        ]);
    }

    public function deleteAssignment($userId, $date, $shiftId)
    {
        return ShiftAssignment::where('user_id', $userId)
            ->where('date', $date)
            ->where('shift_id', $shiftId)
            ->delete();
    }

    /**
     * Xác định ca làm việc thực tế dựa trên độ ưu tiên.
     * Ưu tiên 1: Ca được phân công riêng (ShiftAssignment)
     * Ưu tiên 2: Lịch làm việc mặc định theo Thứ của chức vụ (PositionDefaultSchedule)
     * Mặc định: Trả về null (Ngày nghỉ)
     */
    public function getEffectiveShift(User $user, $date)
    {
        $dateStr = Carbon::parse($date)->format('Y-m-d');

        // 1. Ưu tiên 1: Kiểm tra nghỉ phép ĐÃ DUYỆT
        $isOnLeave = LeaveRequest::where('user_id', $user->id)
            ->where('leave_date', $dateStr)
            ->where('status', LeaveStatus::APPROVED)
            ->exists();

        if ($isOnLeave)
            return null; // Trả về null để hiểu là nghỉ

        // 2. Ưu tiên 2: Ca đặc biệt
        $specific = ShiftAssignment::where('user_id', $user->id)
            ->where('date', $dateStr)
            ->with('shift')->first();
        if ($specific)
            return $specific->shift;

        // 3. Ưu tiên 3: Lịch mặc định theo chức vụ
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;
        $default = PositionDefaultSchedule::where('position_id', $user->position_id)
            ->where('day_of_week', $dayOfWeek)
            ->with('shift')->first();

        return $default ? $default->shift : null;
    }
    /**
     * Lấy danh sách quân số theo từng ca làm việc trong ngày
     */
    public function getStaffCountByShift($date)
    {
        $dateStr = Carbon::parse($date)->format('Y-m-d');
        $allShifts = Shift::all();
        $users = User::where('status', 'ACTIVE')->get();

        $stats = $allShifts->map(function ($shift) use ($users, $dateStr) {
            $count = 0;
            foreach ($users as $user) {
                $effectiveShift = $this->getEffectiveShift($user, $dateStr);
                if ($effectiveShift && $effectiveShift->id === $shift->id) {
                    $count++;
                }
            }
            return [
                'shift_name' => $shift->name,
                'time' => "{$shift->start_time} - {$shift->end_time}",
                'staff_count' => $count
            ];
        });

        return $stats;
    }

    /**
     * Lấy thống kê quân số chi tiết 7 ngày: Gồm thông tin ca và danh sách nhân viên cụ thể.
     */
    public function getWeeklyAttendanceDetailed($startDate)
    {
        $start = Carbon::parse($startDate)->startOfWeek(); // Thứ 2
        $allShifts = Shift::all();
        $weeklyData = [];

        for ($i = 0; $i < 7; $i++) {
            $currentDate = $start->copy()->addDays($i);
            $dateStr = $currentDate->format('Y-m-d');

            // 1. Lấy tất cả nhân viên ĐI LÀM thực tế trong ngày này (Đã check nghỉ phép/đặc biệt/mặc định)
            $staffInDay = $this->getAllStaffScheduleByDate($dateStr);

            // 2. Với mỗi ca, lọc ra danh sách nhân viên thuộc ca đó
            $shiftStats = $allShifts->map(function ($shift) use ($staffInDay) {
                $employeesInShift = $staffInDay->where('shift', $shift->id)->values();

                return [
                    'shift_id' => $shift->id,
                    'shift_name' => $shift->name,
                    'start_time' => $shift->start_time,
                    'end_time' => $shift->end_time,
                    'staff_count' => $employeesInShift->count(),
                    'employees' => $employeesInShift->map(function ($emp) {
                        return [
                            'name' => $emp['name'],
                            'position' => $emp['position']
                        ];
                    })
                ];
            });

            // 3. Gom dữ liệu ngày
            $weeklyData[] = [
                'date' => $dateStr,
                'day_name' => $currentDate->translatedFormat('l'),
                'total_staff_working' => $staffInDay->count(),
                'shifts' => $shiftStats
            ];
        }

        return [
            'week_range' => "Từ {$start->format('d/m/Y')} đến " . $start->copy()->addDays(6)->format('d/m/Y'),
            'weekly_schedule' => $weeklyData
        ];
    }
}