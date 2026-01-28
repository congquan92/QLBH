<?php
namespace App\Http\Controllers\WebAuthn;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Service\WebAuthnService;
use Laragear\WebAuthn\Http\Requests\AssertedRequest;


class WebAuthnController extends Controller
{
    protected $webAuthnService;

    public function __construct(WebAuthnService $webAuthnService)
    {
        $this->webAuthnService = $webAuthnService;
    }

    /**
     * API: Điểm danh bằng vân tay
     * Middleware 'webauthn.confirm' sẽ đảm bảo vân tay đã được quét trước khi vào hàm này
     */
    public function recordAttendance(AssertedRequest $request)
    {
        // 1. Lấy User từ JWT
        $user = auth('api')->user();

        if (!$user) {
            return response()->json(['error' => 'Vui lòng đăng nhập trước'], 401);
        }
        \Log::info('WebAuthn Login Request Data:', $request->all());

        // Log các thông tin quan trọng mà Package đã parse được
        \Log::info('Parsed WebAuthn Data:', [
            'id' => $request->id,              // Credential ID (Base64)
            'rawId' => $request->rawId,        // ID dạng nhị phân
            'clientDataJSON' => $request->clientDataJSON,
            'authenticatorData' => $request->authenticatorData,
            'signature' => $request->signature,
            'userHandle' => $request->userHandle,
        ]);
        $credential = $user->webAuthnCredentials()
            ->where('id', $request->id)
            ->first();

        if (!$credential) {
            return response()->json(['error' => 'Không tìm thấy vân tay này'], 404);
        }

        try {
            // 3. Điểm danh
            $attendance = $this->webAuthnService->recordAttendance($user);

            return response()->json([
                'message' => 'Điểm danh thành công!',
                'data' => $attendance,
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi nghiệp vụ: ' . $e->getMessage()], 500);
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