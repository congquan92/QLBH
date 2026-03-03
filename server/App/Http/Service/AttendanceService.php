<?php

namespace App\Http\Service;

use App\Enums\CheckInStatus;
use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\PositionDefaultSchedule;
use App\Models\ShiftAssignment;
use App\Models\User;
use Carbon\Carbon;
use Exception;

class AttendanceService
{
    /**
     * Logic điểm danh chính (Dùng chung cho cả bấm nút và vân tay)
     */
    public function recordAttendance(User $user): Attendance
    {
        $now = Carbon::now();
        $today = $now->toDateString();
        $dayOfWeek = $now->dayOfWeek; // 0 (CN) -> 6 (T7)

        // 1. Tìm bản ghi điểm danh hôm nay mà CHƯA check-out
        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->whereNull('check_out')
            ->first();

        // --- TRƯỜNG HỢP 1: CHECK-IN ---
        if (!$attendance) {
            // Lấy ca làm việc đang diễn ra dựa trên lịch của nhân viên
            $effectiveShift = $this->getCurrentActiveShift($user, $today, $dayOfWeek, $now);

            if (!$effectiveShift) {
                throw new Exception("Bạn không có ca làm việc nào vào lúc này hoặc đã quá giờ vào ca.");
            }

            // Kiểm tra xem đã có bản ghi nào "hoàn thành" (đã check-out) trong ngày chưa?
            // (Nếu quy định 1 ngày chỉ được đi làm 1 ca thì check đoạn này)
            $alreadyFinished = Attendance::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->whereNotNull('check_out')
                ->exists();
            
            if ($alreadyFinished) {
                throw new Exception("Bạn đã hoàn thành điểm danh cho ngày hôm nay.");
            }

            $status = CheckInStatus::PRESENT;
            $startTime = Carbon::parse($today . ' ' . $effectiveShift->start_time);
            
            // Thời gian ân hạn (Grace Period)
            $graceTime = $startTime->copy()->addMinutes($effectiveShift->grace_period);

            if ($now->greaterThan($graceTime)) {
                $status = CheckInStatus::LATE;
            }

            return Attendance::create([
                'user_id' => $user->id,
                'shift_id' => $effectiveShift->id,
                'date' => $today,
                'check_in' => $now,
                'status' => $status
            ]);
        }

        // --- TRƯỜNG HỢP 2: CHECK-OUT ---
        $checkIn = Carbon::parse($attendance->check_in);
        
        // Ngăn chặn check-out quá sớm (Ví dụ: bấm nhầm ngay sau khi check-in)
        if ($now->diffInMinutes($checkIn) < 5) {
            throw new Exception("Bạn vừa mới Check-in, vui lòng đợi ít nhất 5 phút để Check-out.");
        }

        // Tính tổng giờ làm việc (Làm tròn 2 chữ số thập phân)
        $totalHours = round($checkIn->diffInMinutes($now) / 60, 2);
        
        // Kiểm tra ngày lễ
        $isHoliday = Holiday::where('holiday_date', $today)->exists();

        $attendance->update([
            'check_out' => $now,
            'total_hours' => $totalHours,
            'is_holiday' => $isHoliday
        ]);

        return $attendance;
    }

    /**
     * Tìm ca làm việc đang hoạt động (Priority: Ca gán riêng > Ca mặc định chức vụ)
     */
    private function getCurrentActiveShift(User $user, $today, $dayOfWeek, $now)
    {
        // 1. Kiểm tra ca được gán đích danh (ShiftAssignment)
        $special = ShiftAssignment::where('user_id', $user->id)
            ->where('date', $today)
            ->with('shift')->first();

        $shift = null;
        if ($special) {
            $shift = $special->shift;
        } else {
            // 2. Nếu không có ca gán riêng, lấy ca mặc định theo chức vụ (PositionDefaultSchedule)
            $default = PositionDefaultSchedule::where('position_id', $user->position_id)
                ->where('day_of_week', $dayOfWeek)
                ->with('shift')->first();
            $shift = $default ? $default->shift : null;
        }

        if ($shift) {
            // Cửa sổ điểm danh: 
            // Cho phép check-in sớm 30 phút trước khi bắt đầu
            // Và cho phép check-out muộn nhất đến khi kết thúc ca (hoặc tùy cấu hình)
            $startWindow = Carbon::parse($today . ' ' . $shift->start_time)->subMinutes(30);
            $endWindow = Carbon::parse($today . ' ' . $shift->end_time)->addHours(2); // Cho phép về muộn 2 tiếng vẫn check-out được

            if ($now->between($startWindow, $endWindow)) {
                return $shift;
            }
        }

        return null;
    }

    /**
     * Lấy lịch sử điểm danh cá nhân (Phân trang)
     */
    public function getMyHistory(User $user, int $limit = 10)
    {
        return Attendance::where('user_id', $user->id)
            ->with('shift')
            ->orderBy('date', 'desc')
            ->paginate($limit);
    }
}