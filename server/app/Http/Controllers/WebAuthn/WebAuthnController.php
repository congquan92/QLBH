<?php
namespace App\Http\Controllers\WebAuthn;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Service\WebAuthnService;


class WebAuthnController extends Controller
{
    protected $webAuthnService;

    public function __construct(WebAuthnService $webAuthnService)
    {
        $this->webAuthnService = $webAuthnService;
    }

    /**
     * API: Đăng ký thiết bị (vân tay) mới
     * React gọi tới đây sau khi WebAuthn.register() thành công
     */
    public function register(Request $request)
    {
        $user = $request->user();
        
        try {
            $this->webAuthnService->registerDevice($user, $request);
            return response()->json(['message' => 'Đăng ký vân tay thành công!']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi lưu vân tay: ' . $e->getMessage()], 400);
        }
    }

    /**
     * API: Điểm danh bằng vân tay
     * Middleware 'webauthn.confirm' sẽ đảm bảo vân tay đã được quét trước khi vào hàm này
     */
    public function recordAttendance(Request $request)
    {
        $user = $request->user();

        try {
            $attendance = $this->webAuthnService->recordAttendance($user);
            
            return response()->json([
                'message' => 'Điểm danh thành công!',
                'data' => $attendance
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi điểm danh: ' . $e->getMessage()], 500);
        }
    }

    /**
     * API: Admin Reset vân tay cho nhân viên
     */
    public function adminReset(Request $request, $userId)
    {
        // Kiểm tra quyền admin ở đây nếu cần
        $user = \App\Models\User::findOrFail($userId);
        $this->webAuthnService->resetAllFingerprints($user);

        return response()->json(['message' => 'Đã xóa toàn bộ vân tay của nhân viên này.']);
    }
}