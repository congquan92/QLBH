<?php
namespace App\Http\Controllers;

use App\Http\Requests\Position\PositionScheduleRequest;
use App\Http\Requests\Shift\ShiftAssignmentRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Service\ScheduleService;
use App\Models\User;
use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    use ApiResponse;
    protected $scheduleService;

    public function __construct(ScheduleService $service)
    {
        $this->scheduleService = $service;
    }

    /**
     * Xem lịch làm việc mặc định của một Chức vụ cụ thể
     * GET /api/schedules/positions/{positionId}
     */
    public function getPositionSchedule($positionId)
    {
        $data = $this->scheduleService->getDefaultScheduleByPosition((int) $positionId);

        return $this->success($data, 'Xem lịch làm việc mặc định của một Chức vụ cụ thể.');
    }

    /**
     * Xem báo cáo quân số chi tiết và danh sách nhân viên theo ca trong cả tuần
     * Endpoint: GET /api/schedules/weekly-report?date=2026-02-23
     */
    public function weeklyReport(Request $request)
    {
        // Lấy ngày từ request, nếu không có thì lấy ngày hiện tại
        $date = $request->query('date', now()->format('Y-m-d'));

        // Gọi hàm xử lý chi tiết 7 ngày từ Service
        $data = $this->scheduleService->getWeeklyAttendanceDetailed($date);

        return response()->json([
            'status' => 'success',
            'message' => 'Báo cáo quân số chi tiết trong tuần',
            'data' => $data
        ]);
    }

    /**
     * Xem lịch của TẤT CẢ nhân viên trong 1 ngày (Để biết ai đang làm ca nào)
     */
    public function dailyStaff(Request $request)
    {
        $date = $request->query('date', now()->format('Y-m-d'));
        $data = $this->scheduleService->getAllStaffScheduleByDate($date);

        return response()->json([
            'message' => "Danh sách nhân viên làm việc ngày $date",
            'data' => $data
        ]);
    }

    /**
     * Nhân viên tự xem lịch của bản thân
     * GET /api/schedules/my-schedule?date=2026-02-25
     */
    public function mySchedule(Request $request)
    {
        $user = $request->user();
        $startDate = $request->query('date', now()->format('Y-m-d'));
        $schedule = $this->scheduleService->getEmployeeWeeklySchedule($user, $startDate);

        return response()->json([
            'status' => 'success',
            'employee' => $user->full_name,
            'position' => $user->position->name ?? 'N/A',
            'week_schedule' => $schedule
        ]);
    }

    /**
     * Xem lịch chi tiết theo tuần của 1 nhân viên cụ thể
     */
    public function weeklyEmployee($userId, Request $request)
    {
        $user = User::findOrFail($userId);
        $startDate = $request->query('date', now()->format('Y-m-d'));
        $schedule = $this->scheduleService->getEmployeeWeeklySchedule($user, $startDate);

        return response()->json([
            'employee' => $user->full_name,
            'position' => $user->position->name ?? 'N/A',
            'week_schedule' => $schedule
        ]);
    }

    /**
     * Cài đặt lịch T2-T5 (hoặc bất kỳ) cho một Chức vụ
     */
    public function setPositionDefaultSchedule(PositionScheduleRequest $request, $positionId)
    {
        $position = Position::findOrFail($positionId);

        DB::transaction(function () use ($position, $request) {
            $position->defaultSchedules()->delete();
            $position->defaultSchedules()->createMany($request->schedules);
        });

        return response()->json(['message' => 'Cập nhật lịch mặc định thành công']);
    }

    public function store(ShiftAssignmentRequest $request)
    {
        try {
            $assignment = $this->scheduleService->assignShift($request->validated());
            return response()->json([
                'status' => 'success',
                'message' => 'Phân công ca thành công.',
                'data' => $assignment
            ]);
        } catch (\Exception $e) {
            // Trả về lỗi 400 nếu trùng khung giờ
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function updateAssignment(ShiftAssignmentRequest $request, $id)
    {
        try {
            $assignment = $this->scheduleService->updateAssignment($id, $request->validated());
            return $this->success($assignment, 'Cập nhật phân công ca thành công.');
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function destroy(Request $request)
    {
        // Xóa ca dựa trên User, Ngày và Ca cụ thể
        $this->scheduleService->deleteAssignment(
            $request->user_id,
            $request->date,
            $request->shift_id
        );

        return response()->json(['message' => 'Đã xóa ca làm việc thành công.']);
    }
}