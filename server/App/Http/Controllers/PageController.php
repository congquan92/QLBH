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
        $sort    = $request->query('sort', 'sort_order:asc');
        $page    = (int) $request->query('page', 1);
        $size    = (int) $request->query('size', 10);

        $result = $this->pageService->findAll($keyword, $sort, $page, $size);

        return response()->json($result);
    }

    /**
     * Tạo mới một Page và gán các GroupPermissions
     */
    public function store(PageRequest $request): JsonResponse
    {
        try {
            $page = $this->pageService->createPage($request->validated());
            
            return response()->json([
                'status'  => 201,
                'message' => 'Tạo trang quản trị thành công',
                'data'    => $page
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status'  => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật thông tin Page và danh sách GroupPermissions con
     */
    public function update(PageRequest $request, $id): JsonResponse
    {
        try {
            $page = $this->pageService->updatePage($id, $request->validated());
            
            return response()->json([
                'status'  => 200,
                'message' => 'Cập nhật trang thành công',
                'data'    => $page
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status'  => 400,
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
                'status'  => 200,
                'message' => 'Xóa trang và cập nhật liên kết thành công'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status'  => 400,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}