<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Http\Service\LeaveService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;


class LeaveController extends Controller
{
    use ApiResponse;
    protected $leaveService;

    public function __construct(LeaveService $leaveService)
    {
        $this->leaveService = $leaveService;
    }

    /**
     * API Xem danh sách đơn nghỉ phép (Phân trang, tìm kiếm)
     */
    public function index(Request $request): JsonResponse
    {
        $keyword = $request->query('keyword');
        $status = $request->query('status');
        $sort = $request->query('sort', 'leave_date:desc');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $response = $this->leaveService->findAll($keyword, $status, $sort, $page, $size);

        return $this->success($response, 'Danh sách đơn nghỉ phép.');
    }

    public function myLeaves(Request $request)
    {
        $keyword = $request->query('keyword');
        $status = $request->query('status');
        $sort = $request->query('sort', 'leave_date:desc');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);
        $data = $this->leaveService->findMyLeaves($keyword, $status, $sort, $page, $size);

        return $this->success($data,"List me leave Request");
    }
    /**
     * API Gửi đơn nghỉ phép
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'leave_date' => 'required|date|after:today',
            'shift_id' => 'required|exists:shifts,id',
            'reason' => 'nullable|string|max:255',
        ], [
            'leave_date.required' => 'Ngày nghỉ không được để trống.',
            'leave_date.after' => 'Ngày xin nghỉ phải sau ngày hôm nay.',
            'shift_id.required' => 'Vui lòng chọn ca làm việc muốn nghỉ.',
            'shift_id.exists' => 'Ca làm việc không tồn tại.',
        ]);

        $leave = $this->leaveService->createLeaveRequest($validated);
        return $this->success($leave, 'Gửi đơn nghỉ phép thành công.');
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
        $leave = $this->leaveService->changeStatus($id, $request->status);
        return $this->success($leave, 'Cập nhật trạng thái đơn thành công.');
    }

    /**
     * API Xóa đơn nghỉ phép
     * URL: DELETE /api/leave-requests/{id}
     */
    public function destroy($id): JsonResponse
    {
        $this->leaveService->deleteLeaveRequest($id);
        return $this->success(null, 'Đã xóa đơn nghỉ phép thành công.');
    }
}