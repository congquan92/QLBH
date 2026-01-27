<?php
namespace App\Http\Controllers;

use App\Models\Position;
use App\Models\User;
use Illuminate\Http\Request;

class HRMController extends Controller
{
    // Tạo Chức vụ để gán cho Nhân viên
    public function createPosition(Request $request)
    {
        $request->validate(['name' => 'required', 'base_salary' => 'required|numeric']);
        
        $position = Position::create($request->all());
        return response()->json(['message' => 'Tạo chức vụ thành công', 'data' => $position]);
    }

    // Gán chức vụ cho User (Test Job History)
    public function assignPosition(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $user->update(['position_id' => $request->position_id]);

        // Tạo bản ghi lịch sử
        $user->jobHistories()->create([
            'position_id' => $request->position_id,
            'start_date' => now(),
        ]);

        return response()->json(['message' => 'Đã gán chức vụ cho nhân viên']);
    }

    // Lấy thông tin Dashboard cho React
    public function getDashboardStats(Request $request)
    {
        $user = $request->user();
        $todayAttendance = $user->attendances()->whereDate('date', now())->first();
        
        return response()->json([
            'user' => $user->load('position'),
            'today' => $todayAttendance,
            'total_days_this_month' => $user->attendances()->whereMonth('date', now()->month)->count()
        ]);
    }
}