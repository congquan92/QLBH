<?php
namespace App\Http\Service;

use App\Enums\OTPType;
use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use Brevo\Client\Api\TransactionalEmailsApi;
use Brevo\Client\Api\TransactionalSMSApi;
use Brevo\Client\Configuration;
use Brevo\Client\Model\SendTransacSms;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Log;
class BrevoService
{
    private function getExpiryMinutes()
    {
        return (int) config('services.brevo.otp_valid_minutes', 5);
    }
    private function sendBrevoEmail($user, $otp)
    {
        $config = Configuration::getDefaultConfiguration()->setApiKey('api-key', config('services.brevo.api_key'));
        $apiInstance = new TransactionalEmailsApi(new Client(), $config);

        $sendSmtpEmail = new \Brevo\Client\Model\SendSmtpEmail([
            'templateId' => 2,
            'sender' => [
                'name' => config('services.brevo.sender_name'),
                'email' => config('services.brevo.sender_email')
            ],
            'to' => [['email' => $user->email]],
            'params' => [
                'otp' => $otp,
                'time' => $this->getExpiryMinutes(),
            ]
        ]);

        try {
            $apiInstance->sendTransacEmail($sendSmtpEmail);
            return "Gửi thành công!";
        } catch (\Exception $e) {
            return "Lỗi: " . $e->getMessage();
        }
    }

    public function sendSmsOtp($phoneNumber, $otp)
    {
        $config = Configuration::getDefaultConfiguration()
            ->setApiKey('api-key', config('services.brevo.api_key'));

        $apiInstance = new TransactionalSMSApi(new Client(), $config);

        $recipient = preg_replace('/^0/', '84', $phoneNumber);

        $sendTransacSms = new SendTransacSms([
            'sender' => config('services.brevo.sender_sms'),
            'recipient' => $recipient,
            'content' => "Ma OTP cua ban la: $otp. Ma co hieu luc trong $this->getExpiryMinutes() phut.",
            'type' => 'transactional'
        ]);

        try {
            $result = $apiInstance->sendTransacSms($sendTransacSms);
            return $result;
        } catch (\Exception $e) {
            \Log::error("Brevo SMS Error: " . $e->getMessage());
            return false;
        }
    }

    public function sendTransacNotifications($user, OTPType $otpType, $isEmail)
    {
        // THỐNG NHẤT: Dùng value thay vì name để tránh rắc rối Enum
        $redisKey = 'otp:' . strtolower($otpType->value) . ':' . $user->id;
        \Log::info("Thực hiện lưu OTP vào Cache với Key: " . $redisKey);
        $expiryMinutes = $this->getExpiryMinutes();
        $code = $this->generateCode();

        // SỬA: Dùng Cache::put (tự động xử lý prefix và expiry)
        Cache::put($redisKey, $code, now()->addMinutes($expiryMinutes));

        if ($isEmail)
            return $this->sendBrevoEmail($user, $code);
        else
            return $this->sendSmsOtp($user->phone, $code);
    }

    public function verifyOTP($user, OTPType $otpType, string $inputOtp)
    {
        $redisKey = 'otp:' . strtolower($otpType->value) . ':' . $user->id;
        $attemptKey = $redisKey . ':attempts';

       
        // SỬA: Dùng Cache::get để lấy mã (tự khớp với prefix)
        $cachedOtp = Cache::get($redisKey);

         Log::info("OTP DEBUG", [
            "cached" => $cachedOtp,
            "input" => $inputOtp,
            "redisKey" => $redisKey
        ]);
        if (!$cachedOtp) {
            throw new BusinessException(ErrorCode::NOT_EXISTED, "Mã OTP đã hết hạn hoặc không tồn tại.");
        }

        

        if ((string) $cachedOtp !== (string) $inputOtp) {
            // SỬA: Logic đếm số lần thử sai qua Cache
            $attempts = (int) Cache::get($attemptKey, 0) + 1;
            Cache::put($attemptKey, $attempts, now()->addMinutes(10));

            if ($attempts >= 5) {
                Cache::forget($redisKey); // Xóa OTP
                Cache::forget($attemptKey);
                throw new BusinessException(ErrorCode::TOO_MANY_REQUESTS, "Bạn đã nhập sai quá 5 lần. Mã OTP đã bị hủy.");
            }

            throw new BusinessException(ErrorCode::NOT_VERIFY, "Mã OTP không chính xác. Bạn còn " . (5 - $attempts) . " lần thử.");
        }

        // THÀNH CÔNG: Xóa key
        Cache::forget($redisKey);
        Cache::forget($attemptKey);

        return true;
    }
    private function generateCode()
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}