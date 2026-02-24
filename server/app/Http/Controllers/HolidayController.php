<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Http\Service\HolidayService;
use Illuminate\Http\Request;


class HolidayController extends Controller
{
    use ApiResponse;
    protected $holidayService;

    public function __construct(HolidayService $service)
    {
        $this->holidayService = $service;
    }

    public function index(Request $request)
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort', 'holiday_date:asc');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $response = $this->holidayService->findAll($keyword, $sort, $page, $size);

        return $this->success($response,'Danh sách ngày nghỉ lễ.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'holiday_date' => 'required|date',
        ], [
            'name.required' => 'Tên ngày lễ không được để trống.',
            'name.string' => 'Tên ngày lễ phải là chuỗi ký tự.',
            'holiday_date.required' => 'Ngày lễ không được để trống.',
            'holiday_date.date' => 'Định dạng ngày tháng không hợp lệ.',
        ]);

        $holiday = $this->holidayService->create($validated);
        return $this->success($holiday, 'Thêm ngày lễ thành công!');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'holiday_date' => 'sometimes|date',
        ], [
            'name.string' => 'Tên ngày lễ phải là chuỗi ký tự.',
            'holiday_date.date' => 'Định dạng ngày tháng không hợp lệ.',
        ]);
        $holiday = $this->holidayService->update($id, $validated);
        return $this->success($holiday, 'Cập nhật ngày lễ thành công!');
    }

    public function destroy($id)
    {
        $this->holidayService->delete($id);
        return $this->success(null, 'Đã xóa ngày lễ thành công.');
    }
}