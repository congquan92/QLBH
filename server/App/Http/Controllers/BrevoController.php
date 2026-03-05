<?php
namespace App\Http\Controllers;

use App\Enums\OTPType;
use App\Http\Service\BrevoService;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
class BrevoController extends Controller
{
    protected BrevoService $brevoService;

    public function __construct(BrevoService $brevoService)
    {
        $this->brevoService = $brevoService;
    }

    public function verify(Request $request)
    {
        // 1. Validate các tham số trên URL
        $request->validate([
            'userId' => 'required|exists:users,id',
            'inputOtp' => 'required|string|size:6',
            'otpType' => 'required|string'
        ], [
            'userId.exists' => 'Người dùng không tồn tại.',
            'inputOtp.size' => 'Mã OTP phải có đúng 6 ký tự.'
        ]);

        try {
            // 2. Lấy dữ liệu từ query string
            $userId = $request->query('userId');
            $inputOtp = $request->query('inputOtp');
            $typeStr = $request->query('otpType');

            // 3. Tìm user (vì Service của bạn yêu cầu object $user)
            $user = User::findOrFail($userId);

            // 4. Chuyển đổi string sang Enum OTPType
            // Giả sử Enum của bạn có case VERIFICATION
            $otpType = OTPType::from($typeStr);

            // 5. Gọi Service xử lý
            $this->brevoService->verifyOTP($user, $otpType, $inputOtp);

            return response()->json([
                'status' => 200,
                'message' => 'Xác thực OTP thành công.',
                'success' => true
            ]);

        } catch (\ValueError $e) {
            return response()->json([
                'status' => 400,
                'message' => "Loại OTP '{$typeStr}' không hợp lệ."
            ], 400);
        } catch (Exception $e) {
            return response()->json([
                'status' => $e->getCode() ?: 400,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }
    }
    public function send(Request $request)
    {
        // 1. Validate tham số đầu vào
        $request->validate([
            'otpType' => 'required|string',
            'isEmail' => 'required',
            'userId' => 'required|exists:users,id'
        ]);

        try {
            $userId = $request->query('userId');
            $user = User::findOrFail($userId);
            // 3. Xử lý dữ liệu từ Query Params
            $typeStr = $request->query('otpType');
            // Chuyển đổi giá trị isEmail sang boolean chuẩn
            $isEmail = filter_var($request->query('isEmail'), FILTER_VALIDATE_BOOLEAN);

            // 4. Chuyển đổi string sang Enum OTPType
            $otpType = OTPType::from($typeStr);

            // 5. Gọi Service gửi thông báo
            $this->brevoService->sendTransacNotifications($user, $otpType, $isEmail);

            return response()->json([
                'status' => 200,
                'message' => 'Mã OTP đã được gửi ' . ($isEmail ? 'vào Email' : 'qua SMS') . ' thành công.',
                'success' => true
            ]);

        } catch (\ValueError $e) {
            return response()->json([
                'status' => 400,
                'message' => "Loại OTP '{$typeStr}' không hợp lệ."
            ], 400);
        } catch (Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Lỗi gửi OTP: ' . $e->getMessage()
            ], 500);
        }
    }
}