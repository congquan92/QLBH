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
        $leaveDate = $request->query('leave_date');
        $sort = $request->query('sort', 'leave_date:desc');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $response = $this->leaveService->findAll($keyword, $status, $leaveDate, $sort, $page, $size);

        return $this->success($response, 'Danh sách đơn nghỉ phép.');
    }

    public function myLeaves(Request $request)
    {
        $keyword = $request->query('keyword');
        $status = $request->query('status');
        $leaveDate = $request->query('leave_date');
        $sort = $request->query('sort', 'leave_date:desc');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);
        $data = $this->leaveService->findMyLeaves($keyword, $status, $leaveDate, $sort, $page, $size);

        return $this->success($data,"List me leave Request");
    }

    public function availableShifts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'leave_date' => 'required|date|after:today',
        ], [
            'leave_date.required' => 'Ngày nghỉ không được để trống.',
            'leave_date.after' => 'Ngày xin nghỉ phải sau ngày hôm nay.',
        ]);

        $shifts = $this->leaveService->getAvailableShiftsByDate($validated['leave_date']);
        return $this->success($shifts, 'Danh sách ca làm việc theo ngày đã chọn.');
    }

    /**
     * API Gửi đơn nghỉ phép
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'leave_type' => 'nullable|string|in:ANNUAL,SICK_MATERNITY,RESIGNATION',
            'leave_date' => 'nullable|date|after:today',
            'start_date' => 'nullable|date|after:today',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'shift_id' => 'nullable|exists:shifts,id',
            'reason' => 'nullable|string|max:255',
        ], [
            'leave_date.after' => 'Ngày xin nghỉ phải sau ngày hôm nay.',
            'start_date.after' => 'Ngày bắt đầu phải sau ngày hôm nay.',
            'end_date.after_or_equal' => 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.',
            'shift_id.exists' => 'Ca làm việc không tồn tại.',
        ]);

        $leaveType = $validated['leave_type'] ?? 'ANNUAL';
        if ($leaveType !== 'RESIGNATION' && empty($validated['leave_date']) && empty($validated['start_date'])) {
            return $this->error('Ngày nghỉ không được để trống.', 400);
        }

        $startDate = $validated['start_date'] ?? $validated['leave_date'] ?? null;
        $endDate = $validated['end_date'] ?? $startDate;
        $isSingleDay = $startDate !== null && $endDate !== null && $startDate === $endDate;

        if ($leaveType !== 'RESIGNATION' && $isSingleDay && empty($validated['shift_id'])) {
            return $this->error('Vui lòng chọn ca làm việc muốn nghỉ.', 400);
        }

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