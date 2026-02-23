<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Enums\LeaveStatus;
use Exception;
use Illuminate\Support\Facades\Auth;

class LeaveService
{
    /**
     * Gửi đơn nghỉ phép mới
     */
    public function createLeaveRequest(array $data)
    {
        $exists = LeaveRequest::where('user_id', Auth::id())
            ->where('leave_date', $data['leave_date'])
            ->exists();

        if ($exists) {
            throw new Exception("Bạn đã có một đơn nghỉ phép trong ngày này.");
        }

        return LeaveRequest::create([
            'user_id' => Auth::id(),
            'leave_date' => $data['leave_date'],
            'reason' => $data['reason'] ?? null,
            'status' => LeaveStatus::PENDING,
        ]);
    }

    /**
     * Chuyển trạng thái đơn (Duyệt hoặc Từ chối) - Dành cho Admin
     */
    public function changeStatus($id, string $status)
    {
        $leaveRequest = LeaveRequest::findOrFail($id);
        
        // Sử dụng Enum LeaveStatus để gán giá trị
        $newStatus = LeaveStatus::from($status);

        $leaveRequest->update([
            'status' => $newStatus,
            'approved_by' => Auth::id(),
        ]);

        return $leaveRequest;
    }

    /**
     * Xóa đơn nghỉ phép (Chỉ được xóa khi trạng thái là PENDING)
     */
    public function deleteLeaveRequest($id)
    {
        $leaveRequest = LeaveRequest::findOrFail($id);

        if ($leaveRequest->user_id !== Auth::id()) {
             throw new Exception("Bạn không có quyền xóa đơn của người khác.");
        }

        if ($leaveRequest->status !== LeaveStatus::PENDING) {
            throw new Exception("Không thể xóa đơn đã được Duyệt hoặc đã bị Từ chối.");
        }

        return $leaveRequest->delete();
    }
}