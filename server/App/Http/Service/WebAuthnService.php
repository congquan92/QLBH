<?php
namespace App\Http\Service;

use App\Enums\CheckInStatus;
use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\PositionDefaultSchedule;
use App\Models\ShiftAssignment;
use App\Models\User;
use Carbon\Carbon;
class WebAuthnService
{

    public function listCredentials(User $user)
    {
        return $user->webAuthnCredentials()->get(['id', 'name', 'created_at']);
    }
    public function removeCredential(User $user, $credentialId)
    {
        return $user->webAuthnCredentials()->where('id', $credentialId)->delete();
    }
    public function resetAllFingerprints(User $user)
    {
        return $user->webAuthnCredentials()->delete();
    }
    public function recordAttendance(User $user): Attendance
    {
        $now = Carbon::now();
        $today = $now->toDateString();
        $dayOfWeek = $now->dayOfWeek; // 0 (CN) -> 6 (T7)

        // 1. Tìm bản ghi điểm danh chưa check-out
        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->whereNull('check_out')
            ->first();

        // --- LOGIC CHECK-IN ---
        if (!$attendance) {
            // Lấy ca thực tế đang diễn ra (gọi từ ScheduleService hoặc logic trực tiếp)
            $effectiveShift = $this->getCurrentActiveShift($user, $today, $dayOfWeek, $now);

            if (!$effectiveShift) {
                throw new \Exception("Bạn không có ca làm việc nào vào lúc này hoặc đã quá giờ vào ca.");
            }

            $status = CheckInStatus::PRESENT;
            $startTime = Carbon::parse($today . ' ' . $effectiveShift->start_time);
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

        // --- LOGIC CHECK-OUT ---
        $checkIn = Carbon::parse($attendance->check_in);
        $totalHours = round($checkIn->diffInMinutes($now) / 60, 2);
        $isHoliday = Holiday::where('holiday_date', $today)->exists();

        $attendance->update([
            'check_out' => $now,
            'total_hours' => $totalHours,
            'is_holiday' => $isHoliday
        ]);

        return $attendance;
    }

    /**
     * Hàm phụ trợ để tìm ca đang hoạt động tại thời điểm điểm danh
     */
    private function getCurrentActiveShift(User $user, $today, $dayOfWeek, $now)
    {
        // 1. Kiểm tra ca đặc biệt (ShiftAssignment)
        $special = ShiftAssignment::where('user_id', $user->id)
            ->where('date', $today)
            ->with('shift')->first();

        $shift = null;
        if ($special) {
            $shift = $special->shift;
        } else {
            // 2. Kiểm tra ca mặc định của chức vụ
            $default = PositionDefaultSchedule::where('position_id', $user->position_id)
                ->where('day_of_week', $dayOfWeek)
                ->with('shift')->first();
            $shift = $default ? $default->shift : null;
        }

        if ($shift) {
            // Kiểm tra xem thời gian hiện tại có nằm trong khung giờ ca làm việc không
            // Cho phép check-in sớm 30 phút và check-in muộn cho đến khi hết ca
            $startWindow = Carbon::parse($today . ' ' . $shift->start_time)->subMinutes(30);
            $endWindow = Carbon::parse($today . ' ' . $shift->end_time);

            if ($now->between($startWindow, $endWindow)) {
                return $shift;
            }
        }

        return null;
    }
}