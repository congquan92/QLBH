<?php

use App\Enums\DeliveryStatus;
use App\Http\Service\UserService;
use App\Enums\EmploymentType;
use App\Models\Order;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\JobHistory;
use App\Models\SalaryScale;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 1. Định nghĩa lệnh cập nhật chức vụ
Artisan::command('employee:update-position', function () {
    $today = Carbon::today()->format('Y-m-d');
    
    // Tìm các bản ghi có ngày hiệu lực là hôm nay
    $promotions = JobHistory::where('effective_date', $today)->get();

    if ($promotions->isEmpty()) {
        $this->info("Không có thay đổi chức vụ nào hôm nay.");
        return;
    }

    DB::transaction(function () use ($promotions) {
        foreach ($promotions as $job) {
            User::where('id', $job->user_id)->update([
                'position_id' => $job->position_id
            ]);
        }
    });

    $this->info("Đã cập nhật chức vụ cho " . $promotions->count() . " nhân viên.");
})->purpose('Cập nhật position_id cho nhân viên dựa trên JobHistory');

// 2. Lập lịch chạy tự động mỗi ngày vào lúc 00:00
Schedule::command('employee:update-position')->daily();

Artisan::command('employee:sync-tenure-salary', function () {
    $today = Carbon::today();

    $activeJobs = JobHistory::with(['position'])
        ->where('employment_type', EmploymentType::FULLTIME->value)
        ->where('effective_date', '<=', $today->format('Y-m-d'))
        ->where(function ($query) use ($today) {
            $query->whereNull('end_date')
                ->orWhere('end_date', '>=', $today->format('Y-m-d'));
        })
        ->get();

    if ($activeJobs->isEmpty()) {
        $this->info('Khong co ho so cong viec full-time dang hieu luc de dong bo luong.');
        return;
    }

    $updatedCount = 0;

    DB::transaction(function () use ($activeJobs, $today, &$updatedCount) {
        foreach ($activeJobs as $job) {
            /** @var \App\Models\JobHistory $job */
            if (!$job->position) {
                continue;
            }

            $firstJob = JobHistory::where('user_id', $job->user_id)
                ->where('effective_date', '<=', $today->format('Y-m-d'))
                ->orderBy('effective_date', 'asc')
                ->first();

            $tenureYears = $firstJob
                ? Carbon::parse($firstJob->effective_date)->diffInYears($today)
                : 0;

            $salaryScale = SalaryScale::where('years_of_experience', '<=', $tenureYears)
                ->orderBy('years_of_experience', 'desc')
                ->first();

            $coefficient = $salaryScale ? (float) $salaryScale->coefficient : 1.0;
            $targetSalary = round((float) $job->position->base_salary * $coefficient, 2);

            if (abs((float) $job->current_salary - $targetSalary) >= 0.01) {
                $job->current_salary = $targetSalary;
                $job->save();
                $updatedCount++;
            }
        }
    });

    $this->info("Da dong bo current_salary cho {$updatedCount} nhan vien.");
})->purpose('Dong bo current_salary theo tham nien cho nhan vien full-time dang hieu luc');

Schedule::command('employee:sync-tenure-salary')->dailyAt('00:10');


Artisan::command('orders:auto-confirm', function () {
    $sevenDaysAgo = now()->subDays(7);

    $orders = Order::where('order_status', DeliveryStatus::DELIVERED)
                ->where('delivered_at', '<', $sevenDaysAgo)
                ->get();

    if ($orders->isEmpty()) {
        $this->info("Không có đơn hàng nào cần xác nhận.");
        return;
    }

    foreach ($orders as $order) {
        DB::transaction(function () use ($order) {
            try {
                $order->order_status = DeliveryStatus::COMPLETED;
                $order->completed_at = now();
                /** @var \App\Models\Order $order */
                $order->save();
                
                $user = $order->user;
                if ($user) {
                    $user->total_spent += $order->total_amount;
                    $user->save();
                    
                    // Cập nhật Rank dựa trên chi tiêu mới
                    app(UserService::class)->updateRank($user);
                }
                
                $this->info("Đã xác nhận đơn hàng ID: {$order->id}");
            } catch (\Exception $e) {
                $this->error("Lỗi đơn hàng {$order->id}: " . $e->getMessage());
            }
        });
    }
})->purpose('Tự động hoàn thành đơn hàng sau 7 ngày giao thành công');

// Lập lịch chạy mỗi ngày vào lúc 01:00 sáng (sau khi cập nhật chức vụ xong)
Schedule::command('orders:auto-confirm')->dailyAt('01:00');