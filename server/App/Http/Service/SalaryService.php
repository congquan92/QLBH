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
            throw new \Exception("Khong tim thay thong tin luong cho thang nay.");
        }

        $monthlyBaseSalary = $jobHistory->current_salary;

        // TINH HOURLY RATE
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
                ? ($monthlyBaseSalary / $totalWorkingDaysInMonth / $avgHoursPerDay)
                : 0;
        } else {
            $hourlyRate = $monthlyBaseSalary;
        }

        // TINH BONUS NGAY LE
        $holidayAttendances = Attendance::where('user_id', $userId)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->where('is_holiday', true)
            ->get();

        $totalSalaryBonus = 0;
        $bonusDetails = [];

        foreach ($holidayAttendances as $record) {
            $config = SalaryConfig::where('employee_type', $jobHistory->employment_type)
                ->where('is_holiday', true)
                ->first();

            $multiplier = $config ? $config->multiplier : 1.0;
            $bonusAmount = $record->total_hours * $hourlyRate * $multiplier;

            $totalSalaryBonus += $bonusAmount;
            $bonusDetails[] = [
                'date'  => $record->date,
                'hours' => $record->total_hours,
                'bonus' => round($bonusAmount, 0),
            ];
        }

        $finalSalary = $monthlyBaseSalary + $totalSalaryBonus;

        return [
            'user_id'             => $user->id,
            'employee'            => $user->full_name,
            'month'               => "$month/$year",
            'position'            => $jobHistory->position->name,
            'employment_type'     => $jobHistory->employment_type,
            'base_salary'         => round($monthlyBaseSalary, 0),
            'total_holiday_bonus' => round($totalSalaryBonus, 0),
            'final_salary'        => round($finalSalary, 0),
            'bonus_details'       => $bonusDetails,
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
                    'user_id'             => $employee->id,
                    'employee'            => $employee->full_name,
                    'month'               => "$month/$year",
                    'position'            => optional($employee->position)->name ?? '-',
                    'employment_type'     => null,
                    'base_salary'         => 0,
                    'total_holiday_bonus' => 0,
                    'final_salary'        => 0,
                    'bonus_details'       => [],
                    'status'              => 'error',
                    'error'               => $e->getMessage(),
                ];
            }
        }

        return $results;
    }
}