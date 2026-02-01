<?php

namespace App\Jobs;

use App\Enums\OTPType;
use App\Http\Service\BrevoService;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendOtpJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;
    protected $otpType;
    protected $isEmail;

    // Truyền dữ liệu cần thiết vào Job
    public function __construct(User $user, OTPType $otpType, bool $isEmail)
    {
        $this->user = $user;
        $this->otpType = $otpType;
        $this->isEmail = $isEmail;
    }

    // Logic thực hiện gửi mail nằm ở đây
    public function handle(BrevoService $brevoService)
    {
        $brevoService->sendTransacNotifications($this->user, $this->otpType, $this->isEmail);
    }
}