<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\PageRequest\PageRequest;
use App\Http\Service\PageService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class PageController extends Controller
{
    protected $pageService;

    public function __construct(PageService $pageService)
    {
        $this->pageService = $pageService;
    }

    /**
     * Lấy danh sách Page (Phân trang, Tìm kiếm, Sắp xếp)
     */
    public function index(Request $request): JsonResponse
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort', 'sort_order:asc');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $result = $this->pageService->findAll($keyword, $sort, $page, $size);

        return response()->json($result);
    }

    /**
     * Tạo mới một Page và gán các GroupPermissions
     */
    public function store(PageRequest $request): JsonResponse
    {

        $page = $this->pageService->createPage($request->validated());

        return response()->json([
            'status' => 201,
            'message' => 'Tạo trang quản trị thành công',
            'data' => $page
        ], 201);

    }

    /**
     * Cập nhật thông tin Page và danh sách GroupPermissions con
     */
    public function update(PageRequest $request, $id): JsonResponse
    {
        try {
            $page = $this->pageService->updatePage($id, $request->validated());

            return response()->json([
                'status' => 200,
                'message' => 'Cập nhật trang thành công',
                'data' => $page
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Xóa Page và giải phóng các GroupPermissions liên quan
     */
    public function destroy($id): JsonResponse
    {
        try {
            $this->pageService->deletePage($id);

            return response()->json([
                'status' => 200,
                'message' => 'Xóa trang và cập nhật liên kết thành công'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Lấy chi tiết một Page (Show)
     */
    public function show($id): JsonResponse
    {
        try {
            $result = $this->pageService->findById($id);

            return response()->json([
                'status' => 200,
                'data' => $result
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 404,
                'message' => 'Không tìm thấy trang yêu cầu'
            ], 404);
        }
    }

    public function detachGroups(Request $request, $id): JsonResponse
{
    // 1. Validate dữ liệu đầu vào
    $request->validate([
        'group_permission_ids'   => 'required|array|min:1',
        'group_permission_ids.*' => 'exists:group_permissions,id'
    ], [
        'group_permission_ids.required' => 'Vui lòng chọn ít nhất một nhóm quyền để gỡ.',
        'group_permission_ids.*.exists' => 'Nhóm quyền không tồn tại trong hệ thống.'
    ]);

    try {
        // 2. Gọi Service xử lý logic gỡ bỏ (set page_id = null)
        $result = $this->pageService->detachGroupPermissions($id, $request->group_permission_ids);
        
        return response()->json([
            'status'  => 200,
            'message' => 'Đã gỡ các nhóm quyền khỏi trang thành công',
            'data'    => $result
        ]);
    } catch (Exception $e) {
        return response()->json([
            'status'  => 400,
            'message' => 'Lỗi: ' . $e->getMessage()
        ], 400);
    }
}

}