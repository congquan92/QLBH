<?php

namespace App\Services;

use App\Models\{Attendance, User, SalaryConfig};
use Carbon\Carbon;

class SalaryService
{
    public function calculateMonthlySalary($userId, $month, $year)
    {
        $user = User::with(['position', 'salaryScale'])->findOrFail($userId);
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        // 1. Lấy lương tháng cố định
        $coefficient = $user->salaryScale->coefficient ?? 1.0;
        $monthlyBaseSalary = $user->position->base_salary * $coefficient;

        // 2. Tính lương mỗi giờ để làm cơ sở tính Bonus (nếu tính thưởng theo giờ)
        // Giả sử 1 tháng làm 26 ngày, mỗi ngày 8 tiếng
        $hourlyRate = $monthlyBaseSalary / 26 / 8;

        // 3. Tìm các bản ghi điểm danh vào NGÀY LỄ trong tháng này
        $holidayAttendances = Attendance::where('user_id', $userId)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->where('is_holiday', true) // Chỉ lọc những ngày lễ có đi làm
            ->get();

        $totalBonus = 0;
        $bonusDetails = [];

        foreach ($holidayAttendances as $record) {
            // Lấy hệ số thưởng từ SalaryConfig (Ví dụ: Multiplier = 2.0 nghĩa là thưởng thêm 200% cho số giờ đó)
            $config = SalaryConfig::where('employee_type', $user->getEmploymentTypeAttribute)
                                ->where('is_holiday', true)->first();
            
            $multiplier = $config ? $config->multiplier : 1.0; // Nếu multiplier là 2, tức là thưởng thêm gấp đôi lương giờ

            // Khoản thưởng = Số giờ làm * Lương giờ * Hệ số thưởng
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
            'base_salary' => round($monthlyBaseSalary, 0),
            'total_holiday_bonus' => round($totalSalaryBonus, 0),
            'final_salary' => round($finalSalary, 0),
            'bonus_details' => $bonusDetails
        ];
    }
}