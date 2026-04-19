<?php
namespace App\Http\Service;

use App\Http\Responses\PageResponse;
use App\Models\LeaveRequest;
use App\Enums\LeaveStatus;
use App\Enums\LeaveType;
use App\Enums\UserStatus;
use App\Models\Shift;
use App\Models\PositionDefaultSchedule;
use App\Models\ShiftAssignment;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LeaveService
{
    public function getAvailableShiftsByDate(string $leaveDate): array
    {
        $user = Auth::user();
        $userId = Auth::id();
        $date = Carbon::parse($leaveDate)->toDateString();

        if (!$user) {
            return [];
        }

        $roleName = $user->role?->name;
        if ($roleName === 'ADMIN') {
            return Shift::query()
                ->orderBy('name')
                ->get()
                ->map(fn ($shift) => [
                    'id' => $shift->id,
                    'name' => $shift->name,
                    'start_time' => $shift->start_time,
                    'end_time' => $shift->end_time,
                ])
                ->values()
                ->all();
        }

        $assignedShifts = ShiftAssignment::query()
            ->where('user_id', $userId)
            ->where('date', $date)
            ->with('shift')
            ->get()
            ->map(fn ($item) => $item->shift)
            ->filter();

        if ($assignedShifts->isNotEmpty()) {
            return $assignedShifts
                ->unique('id')
                ->values()
                ->map(fn ($shift) => [
                    'id' => $shift->id,
                    'name' => $shift->name,
                    'start_time' => $shift->start_time,
                    'end_time' => $shift->end_time,
                ])
                ->all();
        }

        $dayOfWeek = Carbon::parse($date)->dayOfWeek;

        return PositionDefaultSchedule::query()
            ->where('position_id', $user->position_id)
            ->where('day_of_week', $dayOfWeek)
            ->with('shift')
            ->get()
            ->map(fn ($item) => $item->shift)
            ->filter()
            ->unique('id')
            ->values()
            ->map(fn ($shift) => [
                'id' => $shift->id,
                'name' => $shift->name,
                'start_time' => $shift->start_time,
                'end_time' => $shift->end_time,
            ])
            ->all();
    }

    public function findAll(?string $keyword, ?string $status, ?string $leaveDate, ?string $sort, int $page, int $size): PageResponse
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

        if (!empty($leaveDate)) {
            $filterDate = Carbon::parse($leaveDate)->toDateString();
            $query->where(function ($q) use ($filterDate) {
                $q->where(function ($subQuery) use ($filterDate) {
                    $subQuery->whereNotNull('start_date')
                        ->whereDate('start_date', '<=', $filterDate)
                        ->whereDate(DB::raw('COALESCE(end_date, start_date)'), '>=', $filterDate);
                })->orWhere(function ($subQuery) use ($filterDate) {
                    $subQuery->whereNull('start_date')
                        ->whereDate('leave_date', $filterDate);
                });
            });
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
            $startDate = $leave->start_date?->format('Y-m-d') ?? $leave->leave_date?->format('Y-m-d');
            $endDate = $leave->end_date?->format('Y-m-d') ?? $startDate;

            return [
                'id' => $leave->id,
                'user_id' => $leave->user?->id,
                'user_name' => $leave->user->full_name ?? 'N/A',
                'leave_type' => $leave->leave_type?->value ?? LeaveType::ANNUAL->value,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'leave_date' => $startDate,
                'reason' => $leave->reason,
                'status' => $leave->status?->value ?? $leave->status,
                'shift' => $leave->shift ? [
                    'id' => $leave->shift->id,
                    'name' => $leave->shift->name,
                    'time' => "{$leave->shift->start_time} - {$leave->shift->end_time}"
                ] : null,
                'created_at' => $leave->created_at?->format('Y-m-d H:i:s'),
            ];
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }

    public function findMyLeaves(?string $keyword, ?string $status, ?string $leaveDate, ?string $sort, int $page, int $size): PageResponse
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

        if (!empty($leaveDate)) {
            $filterDate = Carbon::parse($leaveDate)->toDateString();
            $query->where(function ($q) use ($filterDate) {
                $q->where(function ($subQuery) use ($filterDate) {
                    $subQuery->whereNotNull('start_date')
                        ->whereDate('start_date', '<=', $filterDate)
                        ->whereDate(DB::raw('COALESCE(end_date, start_date)'), '>=', $filterDate);
                })->orWhere(function ($subQuery) use ($filterDate) {
                    $subQuery->whereNull('start_date')
                        ->whereDate('leave_date', $filterDate);
                });
            });
        }

        if (!empty($keyword)) {
            $query->where('reason', 'like', "%{$keyword}%");
        }

        $paginator = $query->paginate($size, ['*'], 'page', $page);

        $dtoItems = $paginator->getCollection()->map(function ($leave) {
            $startDate = $leave->start_date?->format('Y-m-d') ?? $leave->leave_date?->format('Y-m-d');
            $endDate = $leave->end_date?->format('Y-m-d') ?? $startDate;

            return [
                'id' => $leave->id,
                'leave_type' => $leave->leave_type?->value ?? LeaveType::ANNUAL->value,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'leave_date' => $startDate,
                'reason' => $leave->reason,
                'status' => $leave->status?->value ?? $leave->status,
                'shift' => $leave->shift ? [
                    'id' => $leave->shift->id,
                    'name' => $leave->shift->name,
                    'time' => "{$leave->shift->start_time} - {$leave->shift->end_time}"
                ] : null,
                'created_at' => $leave->created_at?->format('Y-m-d H:i:s'),
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
        $leaveType = LeaveType::tryFrom((string) ($data['leave_type'] ?? LeaveType::ANNUAL->value)) ?? LeaveType::ANNUAL;
        $shiftId = isset($data['shift_id']) ? (int) $data['shift_id'] : null;

        $defaultDate = Carbon::tomorrow()->startOfDay();
        $startDate = Carbon::parse($data['start_date'] ?? $data['leave_date'] ?? ($leaveType === LeaveType::RESIGNATION ? $defaultDate : null))->startOfDay();
        $endDate = Carbon::parse($data['end_date'] ?? $data['start_date'] ?? $data['leave_date'] ?? ($leaveType === LeaveType::RESIGNATION ? $defaultDate : null))->startOfDay();
        $isSingleDay = $startDate->toDateString() === $endDate->toDateString();
        if ($endDate->lt($startDate)) {
            throw ValidationException::withMessages([
                'end_date' => ['Ngay ket thuc phai lon hon hoac bang ngay bat dau.'],
            ]);
        }

        $roleName = $user?->role?->name;
        if ($leaveType !== LeaveType::RESIGNATION && $roleName !== 'ADMIN') {
            if ($isSingleDay) {
                $availableShiftIds = collect($this->getAvailableShiftsByDate($startDate->toDateString()))
                    ->pluck('id')
                    ->map(fn ($id) => (int) $id)
                    ->all();

                if ($shiftId === null || !in_array($shiftId, $availableShiftIds, true)) {
                    throw ValidationException::withMessages([
                        'shift_id' => ['Ban khong co lich lam viec cho ca nay vao ngay da chon.'],
                    ]);
                }
            } else {
                $hasAnyScheduledShift = false;
                $cursorDate = $startDate->copy();
                while ($cursorDate->lte($endDate)) {
                    $availableShiftCount = count($this->getAvailableShiftsByDate($cursorDate->toDateString()));
                    if ($availableShiftCount > 0) {
                        $hasAnyScheduledShift = true;
                        break;
                    }
                    $cursorDate->addDay();
                }

                if (!$hasAnyScheduledShift) {
                    throw ValidationException::withMessages([
                        'start_date' => ['Khong co lich lam viec nao trong khoang thoi gian da chon.'],
                    ]);
                }
            }
        }

        if ($leaveType === LeaveType::RESIGNATION) {
            $hasResignationRequest = LeaveRequest::query()
                ->where('user_id', $userId)
                ->where('leave_type', LeaveType::RESIGNATION->value)
                ->whereIn('status', [LeaveStatus::PENDING->value, LeaveStatus::APPROVED->value])
                ->exists();

            if ($hasResignationRequest) {
                throw new Exception('Ban da co don nghi viec truoc do.');
            }
        } else {
            $hasOverlapQuery = LeaveRequest::query()
                ->where('user_id', $userId)
                ->where(function ($query) use ($startDate, $endDate) {
                    $query
                        ->where(function ($subQuery) use ($startDate, $endDate) {
                            $subQuery->whereNotNull('start_date')
                                ->whereDate('start_date', '<=', $endDate->toDateString())
                                ->whereDate(DB::raw('COALESCE(end_date, start_date)'), '>=', $startDate->toDateString());
                        })
                        ->orWhere(function ($subQuery) use ($startDate, $endDate) {
                            $subQuery->whereNull('start_date')
                                ->whereDate('leave_date', '>=', $startDate->toDateString())
                                ->whereDate('leave_date', '<=', $endDate->toDateString());
                        });
                });

            if ($shiftId === null) {
                // Range leave without shift means all actual shifts in that period.
                $hasOverlapQuery->where(function ($query) {
                    $query->whereNull('shift_id')->orWhereNotNull('shift_id');
                });
            } else {
                // Shift-specific leave conflicts with same shift and range/all-shift leaves.
                $hasOverlapQuery->where(function ($query) use ($shiftId) {
                    $query->whereNull('shift_id')->orWhere('shift_id', $shiftId);
                });
            }

            $hasOverlap = $hasOverlapQuery->exists();

            if ($hasOverlap) {
                throw new Exception('Ban da co don nghi phep trung khoang thoi gian da chon.');
            }
        }

        return LeaveRequest::create([
            'user_id' => $userId,
            'shift_id' => $shiftId,
            'leave_type' => $leaveType,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'leave_date' => $startDate->toDateString(),
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

        $newStatus = LeaveStatus::from($status);

        $leaveRequest->update([
            'status' => $newStatus,
            'approved_by' => Auth::id(),
        ]);

        $leaveType = $leaveRequest->leave_type instanceof LeaveType
            ? $leaveRequest->leave_type
            : LeaveType::tryFrom((string) $leaveRequest->leave_type);

        if ($newStatus === LeaveStatus::APPROVED && $leaveType === LeaveType::RESIGNATION) {
            $user = User::find($leaveRequest->user_id);
            if ($user) {
                $user->status = UserStatus::INACTIVE;
                $user->save();
            }
        }

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

        $leaveStatus = $leaveRequest->status instanceof LeaveStatus
            ? $leaveRequest->status
            : LeaveStatus::tryFrom((string) $leaveRequest->status);

        if ($leaveStatus !== LeaveStatus::PENDING) {
            throw new Exception("Không thể xóa đơn đã được Duyệt hoặc đã bị Từ chối.");
        }

        return $leaveRequest->delete();
    }
}