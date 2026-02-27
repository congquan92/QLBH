<?php
namespace App\Http\Service;

use App\Enums\SalaryType;
use App\Models\Position;
use App\Models\SalaryScale;
use App\Models\User;
use App\Models\JobHistory;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class JobHistoryService
{
    public function promoteEmployee($userId, $data)
    {
        return DB::transaction(function () use ($userId, $data) {
            $user = User::findOrFail($userId);
            $position = Position::findOrFail($data['position_id']);
            $coefficient = 1.0;
            if ($position->salary_type === SalaryType::MONTHLY) {
                $yearsOfWork = $this->calculateExperienceYears($user);
                $salaryScale = SalaryScale::where('years_of_experience', '<=', $yearsOfWork)
                    ->orderBy('years_of_experience', 'desc')
                    ->first();

                if ($salaryScale) {
                    $coefficient = $salaryScale->coefficient;
                }
            }

            $calculatedSalary = $position->base_salary * $coefficient;

            JobHistory::where('user_id', $userId)
                ->whereNull('end_date')
                ->update(['end_date' => Carbon::parse($data['effective_date'])->subDay()]);

            $newJob = JobHistory::create([
                'user_id' => $userId,
                'position_id' => $data['position_id'],
                'current_salary' => $calculatedSalary,
                'employment_type' => $data['employment_type'],
                'effective_date' => $data['effective_date'],
                'end_date' => null,
            ]);

            $updateData = [
                'position_id' => $data['position_id']
            ];
            
            if (!empty($data['role_id'])) {
                $updateData['role_id'] = $data['role_id'];
                $updateData['token_version'] = ($user->token_version ?? 0) + 1;
            }

            $user->update($updateData);

            return $newJob;
        });
    }

    public function showCarrerById($userId)
    {
        $user = User::with([
            'position',
            'jobHistories.position'
        ])->findOrFail($userId);
        $years = $this->calculateExperienceYears($user);
        return [
            'user_id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'seniority' => round($years, 1) . ' năm',
            'current_position' => [
                'id' => $user->position->id ?? null,
                'name' => $user->position->name ?? 'N/A',
                'salary' => $user->jobHistories->where('end_date', null)->first()?->current_salary ?? 0,
                'salary_type' => $user->position->salary_type ?? 'N/A'
            ],
            'career_history' => $user->jobHistories->map(function ($history) {
                return [
                    'id' => $history->id,
                    'position_id' => $history->position_id,
                    'position_name' => $history->position->name ?? 'N/A',
                    'salary' => $history->current_salary,
                    'employment_type' => $history->employment_type,
                    'effective_date' => $history->effective_date,
                    'end_date' => $history->end_date ?? 'Hiện tại',
                    'status' => $history->end_date === null ? 'Đang giữ chức' : 'Đã kết thúc'
                ];
            })
        ];
    }

    public function calculateExperienceYears(User $user)
    {
        $firstJob = $user->jobHistories()->oldest('effective_date')->first();
        if (!$firstJob)
            return 0;

        return Carbon::parse($firstJob->effective_date)->diffInYears(now());
    }

    /**
     * Hủy bỏ lần thăng chức gần nhất và quay lại chức vụ cũ
     */
    public function rollbackPromotion($userId)
    {
        return DB::transaction(function () use ($userId) {
            $currentJob = JobHistory::where('user_id', $userId)
                ->whereNull('end_date')
                ->first();

            if (!$currentJob) {
                throw new \Exception("Không tìm thấy chức vụ hiện tại để hoàn tác.");
            }

            $previousJob = JobHistory::where('user_id', $userId)
                ->whereNotNull('end_date')
                ->orderBy('end_date', 'desc')
                ->first();

            if (!$previousJob) {
                throw new \Exception("Không có lịch sử chức vụ cũ để quay lại.");
            }
            $currentJob->delete();
            $previousJob->update(['end_date' => null]);

            User::where('id', $userId)->update([
                'position_id' => $previousJob->position_id
            ]);

            return $previousJob;
        });
    }
}