<?php
namespace App\Http\Service;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
class WebAuthnService{
    public function registerDevice(User $user, $request)
    {
        // Laragear tự động xử lý request để lưu vào bảng webauthn_credentials
        return $user->addWebAuthnCredential($request);
    }

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
    public function recordAttendance(User $user):Attendance{
       $today = Carbon::today()->toDateString();
        $now = Carbon::now();

        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if (!$attendance) {
            // Lần đầu quét trong ngày -> Check-in
            return Attendance::create([
                'user_id' => $user->id,
                'date' => $today,
                'check_in' => $now,
                'status' => 'present'
            ]);
        }

        // Lần thứ 2 quét trong ngày -> Check-out
        $checkIn = Carbon::parse($attendance->check_in);
        // Tính tổng số giờ (ví dụ: 8.5 giờ)
        $totalHours = $checkIn->diffInMinutes($now) / 60;

        $attendance->update([
            'check_out' => $now,
            'total_hours' => round($totalHours, 2)
        ]);
        return $attendance;
    }
}