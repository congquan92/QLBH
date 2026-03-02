<?php
namespace App\Http\Service;

use App\Http\Responses\PageResponse;
use App\Models\LeaveRequest;
use App\Enums\LeaveStatus;
use App\Models\PositionDefaultSchedule;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;

class LeaveService
{
    public function findAll(?string $keyword, ?string $status, ?string $sort, int $page, int $size): PageResponse
{
    $query = LeaveRequest::with(['user', 'shift']);

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

    // Tìm kiếm theo keyword
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
            'user_id'=> $leave->user->id,
            'user_name' => $leave->user->full_name ?? 'N/A',
            'leave_date' => $leave->leave_date->format('Y-m-d'),
            'reason' => $leave->reason,
            'status' => $leave->status,
            'shift' => $leave->shift ? [
                'id' => $leave->shift->id,
                'name' => $leave->shift->name,
                'time' => "{$leave->shift->start_time} - {$leave->shift->end_time}"
            ] : null,
            'created_at' => $leave->created_at->format('Y-m-d H:i:s'),
        ];
    });

    $paginator->setCollection($dtoItems);

    return PageResponse::fromLaravelPaginator($paginator);
}

public function findMyLeaves(?string $keyword, ?string $status, ?string $sort, int $page, int $size): PageResponse
{
    $userId = Auth::id();
    $query = LeaveRequest::where('user_id', $userId)->with(['shift']);

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

    if (!empty($keyword)) {
        $query->where('reason', 'like', "%{$keyword}%");
    }

    $paginator = $query->paginate($size, ['*'], 'page', $page);

    $dtoItems = $paginator->getCollection()->map(function ($leave) {
        return [
            'id' => $leave->id,
            'leave_date' => $leave->leave_date->format('Y-m-d'),
            'reason' => $leave->reason,
            'status' => $leave->status,
            'shift' => $leave->shift ? [
                'id' => $leave->shift->id,
                'name' => $leave->shift->name,
                'time' => "{$leave->shift->start_time} - {$leave->shift->end_time}"
            ] : null,
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
    $userId = Auth::id();
    $user = Auth::user(); 
    $leaveDate = Carbon::parse($data['leave_date']);
    $dayOfWeek = $leaveDate->dayOfWeek; 

    $hasSchedule = PositionDefaultSchedule::where('position_id', $user->position_id)
        ->where('day_of_week', $dayOfWeek)
        ->where('shift_id', $data['shift_id'])
        ->exists();

    if (!$hasSchedule) {
        throw new Exception("Bạn không có lịch làm việc cho ca này vào ngày " . $leaveDate->format('d/m/Y'));
    }

    $exists = LeaveRequest::where('user_id', $userId)
        ->where('leave_date', $data['leave_date'])
        ->where('shift_id', $data['shift_id'])
        ->exists();

    if ($exists) {
        throw new Exception("Bạn đã có một đơn nghỉ phép cho ca này trong ngày đã chọn.");
    }

    return LeaveRequest::create([
        'user_id' => $userId,
        'shift_id' => $data['shift_id'],
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