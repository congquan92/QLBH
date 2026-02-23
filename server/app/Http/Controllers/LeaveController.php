<?php

namespace App\Http\Controllers;

use App\Services\LeaveService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class LeaveController extends Controller
{
    protected $leaveService;

    public function __construct(LeaveService $leaveService)
    {
        $this->leaveService = $leaveService;
    }

    /**
     * API Gửi đơn nghỉ phép
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'leave_date' => 'required|date|after_today', // Ví dụ dùng custom rule hoặc after:today
            'reason' => 'nullable|string|max:255',
        ]);

        try {
            $leave = $this->leaveService->createLeaveRequest($validated);
            return response()->json([
                'message' => 'Gửi đơn nghỉ phép thành công.',
                'data' => $leave
            ], 201);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * API Duyệt hoặc Từ chối đơn (Admin)
     * URL: POST /api/leave-requests/{id}/status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:APPROVED,REJECTED',
        ]);

        try {
            $leave = $this->leaveService->changeStatus($id, $request->status);
            return response()->json([
                'message' => 'Cập nhật trạng thái đơn thành công.',
                'data' => $leave
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 400);
        }
    }

    /**
     * API Xóa đơn nghỉ phép
     * URL: DELETE /api/leave-requests/{id}
     */
    public function destroy($id): JsonResponse
    {
        try {
            $this->leaveService->deleteLeaveRequest($id);
            return response()->json(['message' => 'Đã xóa đơn nghỉ phép thành công.']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }
}