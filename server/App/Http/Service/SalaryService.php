<?php

namespace App\Http\Service;

use App\Enums\EmploymentType;
use App\Models\{Attendance, Bonus, JobHistory, SalaryScale, User, SalaryConfig};
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
            throw new \Exception("Khong tim thay thong tin luong cho thang nay.");
        }

        $monthlyBaseSalary = (float) $jobHistory->current_salary;
        $tenureYears = 0;
        $tenureCoefficient = 1.0;
        $tenureBonusAmount = 0.0;
        $monthlyBaseSalaryBeforeTenure = $monthlyBaseSalary;

        if ($jobHistory->employment_type === EmploymentType::FULLTIME) {
            $firstJob = JobHistory::where('user_id', $userId)
                ->where('effective_date', '<=', $endDate->format('Y-m-d'))
                ->orderBy('effective_date', 'asc')
                ->first();

            if ($firstJob) {
                $tenureYears = Carbon::parse($firstJob->effective_date)->diffInYears($endDate);
            }

            $salaryScale = SalaryScale::where('years_of_experience', '<=', $tenureYears)
                ->orderBy('years_of_experience', 'desc')
                ->first();

            if ($salaryScale) {
                $tenureCoefficient = (float) $salaryScale->coefficient;
            }
        }

        $monthlyBaseSalaryWithTenure = $monthlyBaseSalary;

        if ($jobHistory->employment_type === EmploymentType::FULLTIME) {
            $monthlyBaseSalaryBeforeTenure = (float) ($jobHistory->position->base_salary ?? $monthlyBaseSalary);
            $tenureBonusAmount = $monthlyBaseSalaryWithTenure - $monthlyBaseSalaryBeforeTenure;
            if ($monthlyBaseSalaryBeforeTenure > 0) {
                $tenureCoefficient = $monthlyBaseSalaryWithTenure / $monthlyBaseSalaryBeforeTenure;
            }
        }
        $totalWorkingDaysInMonth = 0;
        $avgHoursPerDay = 0;
        $workingDaysInWeek = [];

        // TINH HOURLY RATE
        // FULL_TIME: luong thang -> quy doi ra luong gio theo lich mac dinh cua vi tri
        // PART_TIME: current_salary duoc xem la luong theo gio
        if ($jobHistory->employment_type === EmploymentType::FULLTIME) {
            $defaultSchedules = $jobHistory->position->defaultSchedules;
            $workingDaysInWeek = $defaultSchedules->pluck('day_of_week')->toArray();

            $totalWorkingDaysInMonth = 0;
            $tempDate = $startDate->copy();
            while ($tempDate->lte($endDate)) {
                if (in_array($tempDate->dayOfWeek, $workingDaysInWeek)) {
                    $totalWorkingDaysInMonth++;
                }
                $tempDate->addDay();
            }

            $avgHoursPerDay = $defaultSchedules->avg(function ($schedule) {
                $shift = $schedule->shift;
                if (!$shift) return 8;
                return Carbon::parse($shift->start_time)->diffInHours(Carbon::parse($shift->end_time));
            }) ?: 8;

            $hourlyRate = ($totalWorkingDaysInMonth > 0)
                ? ($monthlyBaseSalaryWithTenure / $totalWorkingDaysInMonth / $avgHoursPerDay)
                : 0;
        } elseif ($jobHistory->employment_type === EmploymentType::PARTTIME) {
            $hourlyRate = $monthlyBaseSalaryWithTenure;
        } else {
            // Fallback an toan cho cac gia tri khac (neu co)
            $hourlyRate = $monthlyBaseSalaryWithTenure;
        }

        // TINH BONUS NGAY LE
        $holidayAttendances = Attendance::where('user_id', $userId)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->where('is_holiday', true)
            ->get();

        $totalSalaryBonus = 0;
        $bonusDetails = [];

        $holidaySalaryConfig = SalaryConfig::where('employee_type', $jobHistory->employment_type)
            ->where('is_holiday', true)
            ->first();
        $multiplier = $holidaySalaryConfig ? $holidaySalaryConfig->multiplier : 1.0;

        foreach ($holidayAttendances as $record) {
            $bonusAmount = $record->total_hours * $hourlyRate * $multiplier;

            $totalSalaryBonus += $bonusAmount;
            $bonusDetails[] = [
                'date'  => $record->date,
                'hours' => $record->total_hours,
                'bonus' => round($bonusAmount, 0),
            ];
        }

        // TINH BONUS THU CONG (tăng ca, thưởng, phụ cấp)
        $manualBonuses = Bonus::where('user_id', $userId)
            ->where('month', $month)
            ->where('year', $year)
            ->get();

        $totalManualBonus = $manualBonuses->sum('amount');
        $manualBonusDetails = $manualBonuses->map(function ($b) {
            return [
                'id'     => $b->id,
                'amount' => round($b->amount, 0),
                'reason' => $b->reason,
                'type'   => $b->type,
            ];
        })->toArray();

        $finalSalary = $monthlyBaseSalaryWithTenure + $totalSalaryBonus + $totalManualBonus;

        return [
            'user_id'              => $user->id,
            'employee'             => $user->full_name,
            'month'                => "$month/$year",
            'position'             => $jobHistory->position->name,
            'employment_type'      => $jobHistory->employment_type,
            'base_salary'          => round($monthlyBaseSalaryWithTenure, 0),
            'base_salary_before_tenure' => round($monthlyBaseSalaryBeforeTenure, 0),
            'tenure_years'         => $tenureYears,
            'tenure_coefficient'   => round($tenureCoefficient, 4),
            'tenure_bonus_amount'  => round($tenureBonusAmount, 0),
            'total_holiday_bonus'  => round($totalSalaryBonus, 0),
            'total_manual_bonus'   => round($totalManualBonus, 0),
            'manual_bonus_details' => $manualBonusDetails,
            'final_salary'         => round($finalSalary, 0),
            'bonus_details'        => $bonusDetails,
        ];
    }

    /**
     * Tinh luong cho tat ca nhan vien (role name != 'USER') trong 1 thang.
     * User model dung single role qua role_id (belongsTo), khong phai many-to-many.
     */
    public function calculateAllMonthlySalaries($month, $year)
    {
        // User co role_id FK toi bang roles, dung whereHas('role', ...) (singular)
        $employees = User::whereHas('role', function ($q) {
                $q->where('name', '!=', 'USER');
            })
            ->with(['position', 'role'])
            ->get();

        $results = [];

        foreach ($employees as $employee) {
            try {
                $salary = $this->calculateMonthlySalary($employee->id, $month, $year);
                $results[] = array_merge($salary, ['status' => 'ok', 'error' => null]);
            } catch (\Exception $e) {
                $results[] = [
                    'user_id'              => $employee->id,
                    'employee'             => $employee->full_name,
                    'month'                => "$month/$year",
                    'position'             => optional($employee->position)->name ?? '-',
                    'employment_type'      => null,
                    'base_salary'          => 0,
                    'total_holiday_bonus'  => 0,
                    'total_manual_bonus'   => 0,
                    'manual_bonus_details' => [],
                    'final_salary'         => 0,
                    'bonus_details'        => [],
                    'status'               => 'error',
                    'error'                => $e->getMessage(),
                ];
            }
        }

        return $results;
    }
}