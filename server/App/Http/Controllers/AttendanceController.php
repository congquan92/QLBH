<?php

namespace App\Http\Controllers;


use App\Http\Service\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;

class AttendanceController extends Controller
{
    protected AttendanceService $attendanceService;

    /**
     * Dependency Injection AttendanceService
     */
    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * API: Thực hiện điểm danh (Check-in hoặc Check-out tự động)
     * POST /api/attendance/record
     */
    public function record(Request $request): JsonResponse
    {
        try {
            // 1. Lấy thông tin user từ JWT (Middleware auth:api đã xác thực)
            $user = auth('api')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Người dùng chưa đăng nhập hoặc token hết hạn.'
                ], 401);
            }

            // 2. Gọi Service thực hiện nghiệp vụ điểm danh
            // Logic trong service sẽ tự động phân biệt Check-in/Check-out
            $attendance = $this->attendanceService->recordAttendance($user);

            // 3. Phân loại phản hồi dựa trên kết quả trả về
            $isCheckOut = !is_null($attendance->check_out);
            
            return response()->json([
                'success' => true,
                'type' => $isCheckOut ? 'CHECK_OUT' : 'CHECK_IN',
                'message' => $isCheckOut ? 'Check-out thành công!' : 'Check-in thành công!',
                'data' => [
                    'id' => $attendance->id,
                    'date' => $attendance->date,
                    'check_in' => $attendance->check_in,
                    'check_out' => $attendance->check_out,
                    'status' => $attendance->status, // PRESENT hoặc LATE
                    'total_hours' => $attendance->total_hours,
                    'shift_name' => $attendance->shift->name ?? 'N/A'
                ]
            ], 200);

        } catch (Exception $e) {
            // Log lỗi để admin kiểm tra nếu cần
            Log::error("Attendance Error for User ID " . (auth('api')->id() ?? 'Unknown') . ": " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400); // Trả về 400 cho các lỗi nghiệp vụ (sai ca, quá giờ...)
        }
    }

    /**
     * API: Lấy lịch sử điểm danh của cá nhân
     * GET /api/attendance/my-history
     */
    public function history(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $limit = $request->query('limit', 10);

        $history = $this->attendanceService->getMyHistory($user, (int)$limit);

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }
}