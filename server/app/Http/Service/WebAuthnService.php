<?php
namespace App\Http\Service;

use App\Enums\CheckInStatus;
use App\Enums\EmploymentType;
use App\Models\Attendance;
use App\Models\Holiday;
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

        $assignment = ShiftAssignment::with('shift')
            ->where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->whereNull('check_out')
            ->first();

        if (!$attendance) {
      
            $status = CheckInStatus::PRESENT;
            if ($assignment && $assignment->shift) {
                
                $startTime = Carbon::parse($today . ' ' . $assignment->shift->start_time);
                $graceTime = $startTime->addMinutes($assignment->shift->grace_period);

                if ($now->greaterThan($graceTime)) {
                    $status = CheckInStatus::LATE;
                }
            } else {
                $status = ($user->employment_type === EmploymentType::FULLTIME) 
                    ? CheckInStatus::OT 
                    : CheckInStatus::PRESENT;
            }

            return Attendance::create([
                'user_id'  => $user->id,
                'shift_id' => $assignment ? $assignment->shift_id : null,
                'date'     => $today,
                'check_in' => $now,
                'status'   => $status 
            ]);
        }


        $checkIn = Carbon::parse($attendance->check_in);
        
       
        $totalHours = round($checkIn->diffInMinutes($now) / 60, 2);

    
        $isHoliday = Holiday::where('holiday_date', $today)->exists();

        $attendance->update([
            'check_out'   => $now,
            'total_hours' => $totalHours,
            'is_holiday'  => $isHoliday
        ]);

        return $attendance;
    }
}