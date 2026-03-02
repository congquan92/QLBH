<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Position\PositionRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Service\PositionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

class PositionController extends Controller
{
    use ApiResponse;
    protected $positionService;

    public function __construct(PositionService $service)
    {
        $this->positionService = $service;
    }

    /**
     * Lấy danh sách chức vụ (có tìm kiếm, sắp xếp, phân trang)
     * GET /api/positions?keyword=...&sort=name:asc&page=1&size=10
     */
    public function index(Request $request): JsonResponse
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $data = $this->positionService->findAll($keyword, $sort, $page, $size);

        return response()->json($data);
    }

    /**
     * Tạo chức vụ mới
     * POST /api/positions
     */
    public function store(PositionRequest $request): JsonResponse
    {
        $position = $this->positionService->store($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Tạo chức vụ thành công!',
            'data' => $position
        ], 201);
    }

    /**
     * Cập nhật thông tin chức vụ
     * PUT /api/positions/{id}
     */
    public function update(PositionRequest $request, $id): JsonResponse
    {
        $position = $this->positionService->update((int) $id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật chức vụ thành công!',
            'data' => $position
        ]);
    }

    /**
     * Lấy danh sách nhân viên thuộc một chức vụ cụ thể
     * GET /api/positions/{id}/employees
     */
    public function getEmployees($id, Request $request): JsonResponse
    {
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $data = $this->positionService->getEmployeesByPosition((int) $id, $page, $size);

        return response()->json($data);
    }

    /**
     * Xóa hẳn một chức vụ khỏi hệ thống
     * DELETE /api/positions/{id}
     */
    public function destroy($id): JsonResponse
    {
        $this->positionService->delete((int) $id);

        return $this->success(null,'Đã xóa chức vụ thành công.');
    }
}