<?php
namespace App\Http\Controllers;
use App\Http\Responses\ApiResponse;
use App\Http\Service\JobHistoryService;
use App\Models\User;
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
        $data = $this->employeeService->showCarrerById($id);

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }
    public function showCarrerMe()
    {
        $user = auth()->user();
        $data = $this->employeeService->showCarrerById($user->id);


        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }
}