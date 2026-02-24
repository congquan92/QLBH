<?php
namespace App\Service;

use App\Models\User;
use App\Models\JobHistory;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class JobHistoryService
{
    public function promoteEmployee($userId, $data)
    {
        return DB::transaction(function () use ($userId, $data) {
            JobHistory::where('user_id', $userId)
                ->whereNull('end_date')
                ->update(['end_date' => Carbon::parse($data['effective_date'])->subDay()]);

            return JobHistory::create([
                'user_id' => $userId,
                'position_id' => $data['position_id'],
                'current_salary' => $data['current_salary'],
                'employment_type' => $data['employment_type'],
                'effective_date' => $data['effective_date'],
                'end_date' => null,
            ]);
        });
    }

    public function calculateExperienceYears(User $user)
    {
        $firstJob = $user->jobHistories()->oldest('effective_date')->first();
        if (!$firstJob) return 0;
        
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

            $currentJob::destroy($currentJob->id);

            $previousJob->update(['end_date' => null]);

            return $previousJob;
        });
    }
}