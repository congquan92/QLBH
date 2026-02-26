<?php
namespace App\Http\Service;

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

        $assignments = ShiftAssignment::where('user_id', $user->id)
            ->whereBetween('date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->with('shift')
            ->get()
            ->groupBy('date');

        $defaultSchedules = PositionDefaultSchedule::where('position_id', $user->position_id)
            ->with('shift')
            ->get()
            ->groupBy('day_of_week');

        $approvedLeaves = LeaveRequest::where('user_id', $user->id)
            ->whereBetween('leave_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->where('status', 'APPROVED')
            ->get()
            ->groupBy(function ($data) {
                return Carbon::parse($data->leave_date)->format('Y-m-d');
            });

        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $dateStr = $date->format('Y-m-d');
            $dayOfWeek = $date->dayOfWeekIso;

            $leaveShiftIds = isset($approvedLeaves[$dateStr])
                ? $approvedLeaves[$dateStr]->pluck('shift_id')->toArray()
                : [];

            $dayShifts = [];
            if (isset($assignments[$dateStr])) {
                foreach ($assignments[$dateStr] as $item) {
                    if (!in_array($item->shift_id, $leaveShiftIds)) {
                        $dayShifts[] = [
                            'shift_id' => $item->shift->id,
                            'shift_name' => $item->shift->name,
                            'time' => "{$item->shift->start_time} - {$item->shift->end_time}",
                            'type' => 'Ca đặc biệt'
                        ];
                    }
                }
            } elseif (isset($defaultSchedules[$dayOfWeek])) {
                foreach ($defaultSchedules[$dayOfWeek] as $item) {
                    if (!in_array($item->shift_id, $leaveShiftIds)) {
                        $dayShifts[] = [
                            'shift_id' => $item->shift->id,
                            'shift_name' => $item->shift->name,
                            'time' => "{$item->shift->start_time} - {$item->shift->end_time}",
                            'type' => 'Mặc định'
                        ];
                    }
                }
            }

            if (empty($dayShifts)) {
                $dayShifts[] = [
                    'shift_id' => null,
                    'shift_name' => 'Nghỉ',
                    'time' => '-',
                    'type' => 'Nghỉ'
                ];
            }

            $schedule[] = [
                'date' => $dateStr,
                'day_name' => $date->translatedFormat('l'),
                'shifts' => $dayShifts
            ];
        }

        return $schedule;
    }

    /**
     * Xem toàn bộ nhân viên làm việc trong một ngày cụ thể
     */
    public function getAllStaffScheduleByDate($date)
    {
        $dayOfWeek = Carbon::parse($date)->dayOfWeekIso;

        // 1. Eager load cực nhanh: Lấy User, Position, DefaultSchedules và Shift cùng lúc
        $users = User::with(['position.defaultSchedules.shift'])->get();

        // 2. Tối ưu: Lấy toàn bộ đơn nghỉ và ca đặc biệt của ngày đó TRƯỚC khi vào vòng lặp
        $allApprovedLeaves = LeaveRequest::where('leave_date', $date)
            ->where('status', 'APPROVED')
            ->get()
            ->groupBy('user_id');

        $allSpecialAssignments = ShiftAssignment::where('date', $date)
            ->with('shift')
            ->get()
            ->groupBy('user_id');

        $finalSchedule = $users->map(function ($user) use ($dayOfWeek, $allApprovedLeaves, $allSpecialAssignments) {
            // Lấy danh sách ID ca nghỉ của user này
            $userLeaves = isset($allApprovedLeaves[$user->id])
                ? $allApprovedLeaves[$user->id]->pluck('shift_id')->toArray()
                : [];

            $dayShifts = collect();

            // 3. Kiểm tra Ca đặc biệt (Ưu tiên)
            if (isset($allSpecialAssignments[$user->id])) {
                foreach ($allSpecialAssignments[$user->id] as $assign) {
                    if (!in_array($assign->shift_id, $userLeaves)) {
                        $dayShifts->push([
                            'id' => $assign->shift->id,
                            'name' => $assign->shift->name,
                            'time' => "{$assign->shift->start_time} - {$assign->shift->end_time}",
                            'is_special' => true
                        ]);
                    }
                }
            }
            // 4. Nếu không có ca đặc biệt, lấy lịch mặc định
            else if ($user->position && $user->position->defaultSchedules) {
                $defaults = $user->position->defaultSchedules->where('day_of_week', $dayOfWeek);
                foreach ($defaults as $default) {
                    if (!in_array($default->shift_id, $userLeaves)) {
                        $dayShifts->push([
                            'id' => $default->shift->id,
                            'name' => $default->shift->name,
                            'time' => "{$default->shift->start_time} - {$default->shift->end_time}",
                            'is_special' => false
                        ]);
                    }
                }
            }

            // 5. Trả về cấu trúc gom nhóm theo User
            if ($dayShifts->isEmpty())
                return null; // Không có ca thì bỏ qua hoặc trả về mảng "Nghỉ" tùy bạn

            return [
                'user_id' => $user->id,
                'name' => $user->full_name,
                'position' => $user->position->name ?? 'N/A',
                'shifts' => $dayShifts->values()->all()
            ];
        })->filter()->values(); // filter() để loại bỏ các user không có lịch làm việc trong ngày

        return $finalSchedule;
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

    public function updateAssignment($id, array $data)
    {
        $assignment = ShiftAssignment::findOrFail($id);
        $newShift = Shift::findOrFail($data['shift_id']);

        // Kiểm tra trùng lặp (Overlapping) tương tự như lúc tạo mới
        $existing = ShiftAssignment::where('user_id', $assignment->user_id)
            ->where('date', $data['date'] ?? $assignment->date)
            ->where('id', '!=', $id)
            ->get();

        foreach ($existing as $item) {
            $old = $item->shift;
            $isOverlapping = ($newShift->start_time < $old->end_time) &&
                ($newShift->end_time > $old->start_time);

            if ($isOverlapping) {
                throw new Exception("Lỗi: Ca mới trùng khung giờ với ca '{$old->name}' đã có.");
            }
        }

        $assignment->update($data);
        return $assignment;
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
    public function getEffectiveShift($user, $date)
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
                'shift_id' => $shift->id,
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
                            'user_id' => $emp['user_id'],
                            'name' => $emp['name'],
                            'position' => $emp['position'],
                            'is_special' => $emp['is_special'], // TRẢ VỀ Ở ĐÂY
                            'assignment_type' => $emp['is_special'] ? 'Ca đặc biệt' : 'Mặc định'
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

    // App\Http\Service\ScheduleService.php

    public function getDefaultScheduleByPosition(int $positionId)
    {
        $position = \App\Models\Position::with(['defaultSchedules.shift'])->findOrFail($positionId);

        $daysVi = [
            0 => 'Chủ Nhật',
            1 => 'Thứ Hai',
            2 => 'Thứ Ba',
            3 => 'Thứ Tư',
            4 => 'Thứ Năm',
            5 => 'Thứ Sáu',
            6 => 'Thứ Bảy',
        ];

        $schedules = $position->defaultSchedules->sortBy('day_of_week')->map(function ($item) use ($daysVi) {
            return [
                'day_of_week' => $item->day_of_week,
                'day_name' => $daysVi[$item->day_of_week] ?? 'N/A',
                'shift_id' => $item->shift_id,
                'shift_name' => $item->shift->name ?? 'N/A',
                'start_time' => $item->shift->start_time ?? '-',
                'end_time' => $item->shift->end_time ?? '-',
            ];
        })->values();

        return [
            'position' => [
                'id' => $position->id,
                'name' => $position->name,
                'base_salary' => $position->base_salary,
                'salary_type' => $position->salary_type,
            ],
            'default_schedules' => $schedules
        ];
    }
}