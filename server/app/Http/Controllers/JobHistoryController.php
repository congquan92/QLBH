<?php
namespace App\Http\Controllers;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use App\Service\JobHistoryService;
use Illuminate\Http\Request;

class JobHistoryController extends Controller
{
    use ApiResponse;
    protected $employeeService;

    public function __construct(JobHistoryService $service)
    {
        $this->employeeService = $service;
    }

    public function promote(Request $request, $userId)
    {
        $request->validate([
            'position_id' => 'required|exists:positions,id',
            'current_salary' => 'required|numeric',
            'employment_type' => 'required',
            'effective_date' => 'required|date|after:today'
        ], [
            'effective_date.after' => 'Ngày hiệu lực phải từ ngày mai trở đi.'
        ]);

        $history = $this->employeeService->promoteEmployee($userId, $request->all());
        return $this->success($history, 'Thay đổi chức vụ thành công. Lương mới sẽ áp dụng từ ' . $history->effective_date);
    }

    public function showCarrerById($id)
    {
        $user = User::findOrFail($id);
        $years = $this->employeeService->calculateExperienceYears($user);

        return response()->json([
            'full_name' => $user->full_name,
            'seniority' => $years . ' năm',
            'current_salary' => $user->current_salary
        ]);
    }
     public function showCarrerMe($id)
    {
        $user = auth()->user();
        $years = $this->employeeService->calculateExperienceYears($user);

        return response()->json([
            'full_name' => $user->full_name,
            'seniority' => $years . ' năm',
            'current_salary' => $user->current_salary
        ]);
    }
}