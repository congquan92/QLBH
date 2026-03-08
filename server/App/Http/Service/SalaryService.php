<?php

namespace App\Http\Service;

use App\Enums\EmploymentType;
use App\Models\{Attendance, JobHistory, User, SalaryConfig};
use Carbon\Carbon;

class SalaryService
{
    public function calculateMonthlySalary($userId, $month, $year)
    {
        $user = User::with(['position'])->findOrFail($userId);
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $jobHistory = JobHistory::where('user_id', $userId)
            ->where('effective_date', '<=', $endDate->format('Y-m-d'))
            ->where(function ($query) use ($startDate) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', $startDate->format('Y-m-d'));
            })
            ->orderBy('effective_date', 'desc')
            ->first();

        if (!$jobHistory) {
            throw new \Exception("Không tìm thấy thông tin lương hợp lệ cho tháng này.");
        }

        $monthlyBaseSalary = $jobHistory->current_salary;

        // 2. TÍNH HOURLY RATE DỰA TRÊN LOẠI HÌNH CÔNG VIỆC
        if ($jobHistory->employment_type === EmploymentType::FULLTIME) {
            // Lấy các ngày làm việc mặc định trong tuần (VD: T2 -> T6)
            $defaultSchedules = $jobHistory->position->defaultSchedules;
            $workingDaysInWeek = $defaultSchedules->pluck('day_of_week')->toArray(); // [1, 2, 3, 4, 5]

            // Đếm tổng số ngày làm việc thực tế trong tháng này dựa trên lịch mặc định
            $totalWorkingDaysInMonth = 0;
            $tempDate = $startDate->copy();
            while ($tempDate->lte($endDate)) {
                if (in_array($tempDate->dayOfWeek, $workingDaysInWeek)) {
                    $totalWorkingDaysInMonth++;
                }
                $tempDate->addDay();
            }

            // Tính trung bình số giờ làm việc mỗi ngày từ các ca (Shift)
            $avgHoursPerDay = $defaultSchedules->avg(function ($schedule) {
                $shift = $schedule->shift;
                if (!$shift)
                    return 8; // Mặc định 8h nếu không có ca
                return Carbon::parse($shift->start_time)->diffInHours(Carbon::parse($shift->end_time));
            }) ?: 8;

            // Công thức: Lương tháng / Tổng ngày làm trong tháng / Số giờ mỗi ngày
            $hourlyRate = ($totalWorkingDaysInMonth > 0)
                ? ($monthlyBaseSalary / $totalWorkingDaysInMonth / $avgHoursPerDay)
                : 0;

        } else {
            // PART_TIME: Lấy trực tiếp lương trong JobHistory (Lương theo giờ)
            $hourlyRate = $monthlyBaseSalary;
        }
        // 3. Tính thưởng ngày lễ (Bonus)
        $holidayAttendances = Attendance::where('user_id', $userId)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->where('is_holiday', true)
            ->get();

        $totalSalaryBonus = 0;
        $bonusDetails = [];

        foreach ($holidayAttendances as $record) {
            // Lấy config thưởng theo loại hình (Full-time/Part-time) từ JobHistory
            $config = SalaryConfig::where('employee_type', $jobHistory->employment_type)
                ->where('is_holiday', true)
                ->first();

            $multiplier = $config ? $config->multiplier : 1.0;
            $bonusAmount = $record->total_hours * $hourlyRate * $multiplier;

            $totalSalaryBonus += $bonusAmount;
            $bonusDetails[] = [
                'date' => $record->date,
                'hours' => $record->total_hours,
                'bonus' => round($bonusAmount, 0)
            ];
        }

        // 4. Tổng lương cuối cùng
        $finalSalary = $monthlyBaseSalary + $totalSalaryBonus;

        return [
            'employee' => $user->full_name,
            'month' => "$month/$year",
            'position' => $jobHistory->position->name,
            'base_salary' => round($monthlyBaseSalary, 0),
            'total_holiday_bonus' => round($totalSalaryBonus, 0),
            'final_salary' => round($finalSalary, 0),
            'bonus_details' => $bonusDetails
        ];
    }
}