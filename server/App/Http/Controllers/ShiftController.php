<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Http\Service\ShiftService;
use Illuminate\Http\Request;
use Exception;

class ShiftController extends Controller
{
    use ApiResponse;

    protected $shiftService;

    public function __construct(ShiftService $service)
    {
        $this->shiftService = $service;
    }

    /**
     * API Lấy danh sách ca làm việc (Phân trang & Tìm kiếm)
     */
    public function index(Request $request)
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort', 'start_time:asc');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $response = $this->shiftService->findAll($keyword, $sort, $page, $size);

        return $this->success($response, 'Danh sách ca làm việc.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s',
            'grace_period' => 'nullable|integer|min:0'
        ], [
            'name.required' => 'Tên ca không được để trống.',
            'start_time.date_format' => 'Giờ bắt đầu không đúng định dạng HH:mm:ss.',
            'end_time.date_format' => 'Giờ kết thúc không đúng định dạng HH:mm:ss.',
        ]);

        $shift = $this->shiftService->create($validated);
        return $this->success($shift, 'Tạo ca làm việc thành công!');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'start_time' => 'sometimes|date_format:H:i:s',
            'end_time' => 'sometimes|date_format:H:i:s',
            'grace_period' => 'nullable|integer|min:0'
        ]);

        $shift = $this->shiftService->update($id, $validated);
        return $this->success($shift, 'Cập nhật ca làm việc thành công!');
    }

    public function destroy($id)
    {
        try {
            $this->shiftService->delete($id);
            return $this->success(null, 'Đã xóa ca làm việc thành công.');
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}