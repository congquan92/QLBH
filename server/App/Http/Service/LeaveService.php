<?php
namespace App\Http\Service;

use App\Http\Responses\PageResponse;
use App\Models\LeaveRequest;
use App\Enums\LeaveStatus;
use Exception;
use Illuminate\Support\Facades\Auth;

class LeaveService
{
    public function findAll(?string $keyword, ?string $status, ?string $sort, int $page, int $size): PageResponse
    {
        $query = LeaveRequest::with('user');

        $column = 'leave_date';
        $direction = 'desc';
        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
        }
        $query->orderBy($column, $direction);

        if (!empty($status)) {
            $query->where('status', $status);
        }

        $currentUser = Auth::user();
        if ($currentUser && !$currentUser->is_admin) {
            $query->where('user_id', $currentUser->id);
        }

        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('reason', 'like', "%{$keyword}%")
                    ->orWhereHas('user', function ($userQuery) use ($keyword) {
                        $userQuery->where('full_name', 'like', "%{$keyword}%");
                    });
            });
        }

        $paginator = $query->paginate($size, ['*'], 'page', $page);
        $dtoItems = $paginator->getCollection()->map(function ($leave) {
            return [
                'id' => $leave->id,
                'user_name' => $leave->user->full_name ?? 'N/A',
                'user_id'=> $leave->user->id,
                'leave_date' => $leave->leave_date->format('Y-m-d'),
                'reason' => $leave->reason,
                'status' => $leave->status,
                'created_at' => $leave->created_at->format('Y-m-d H:i:s'),
            ];
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }
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