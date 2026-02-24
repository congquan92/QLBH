<?php
namespace App\Http\Controllers;

use App\Http\Requests\Product\PositionCreationRequest;
use App\Http\Service\HRMService;
use App\Models\Position;
use App\Models\User;
use Illuminate\Http\Request;

class HRMController extends Controller
{
      protected HRMService $hrmService;

     public function __construct(HRMService $hrmService)
    {
        $this->hrmService = $hrmService;
    }
    public function createPosition(PositionCreationRequest $request)
    {
        $this->hrmService->createPosition($request);
    }

    // Gán chức vụ cho User (Test Job History)
    public function assignPosition(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $user->update(['position_id' => $request->position_id]);

        $user->jobHistories()->create([
            'position_id' => $request->position_id,
            'start_date' => now(),
        ]);
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