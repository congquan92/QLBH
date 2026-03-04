<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Service\RoleService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class RoleController extends Controller
{
    protected $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    /**
     * Lấy danh sách Vai trò (Phân trang, tìm kiếm, sắp xếp)
     */
    public function index(Request $request): JsonResponse
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort');
        $page = (int)$request->query('page', 1);
        $size = (int)$request->query('size', 10);

        $result = $this->roleService->findAll($keyword, $sort, $page, $size);
        
        return response()->json($result);
    }

    /**
     * Xem chi tiết Vai trò
     */
    public function show($id): JsonResponse
    {
        return response()->json([
            'status' => 200,
            'data' => $this->roleService->getById($id)
        ]);
    }

    /**
     * Lưu Vai trò mới và gán danh sách Pages
     */
    public function store(Request $request): JsonResponse
    {
        // Sử dụng Page_ids thay vì group_permission_ids
        $data = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:ACTIVE,INACTIVE',
            'page_ids' => 'nullable|array',
            'page_ids.*' => 'exists:pages,id'
        ]);

        return response()->json([
            'status' => 201,
            'message' => 'Tạo vai trò thành công',
            'data' => $this->roleService->create($data)
        ], 201);
    }

    /**
     * Cập nhật Vai trò và danh sách Pages
     */
    public function update(Request $request, $id): JsonResponse
    {
        $data = $request->validate([
            'name' => 'nullable|string|unique:roles,name,' . $id,
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:ACTIVE,INACTIVE',
            'page_ids' => 'nullable|array',
            'page_ids.*' => 'exists:pages,id'
        ]);

        return response()->json([
            'status' => 200,
            'message' => 'Cập nhật vai trò thành công',
            'data' => $this->roleService->update($id, $data)
        ]);
    }

    /**
     * Gỡ bỏ các Trang (Pages) khỏi vai trò
     * (Thay thế cho detachGroups cũ)
     */
    public function detachPages(Request $request, $id): JsonResponse
    {
        $request->validate([
            'page_ids' => 'required|array',
            'page_ids.*' => 'exists:pages,id'
        ]);
        
        return response()->json([
            'status' => 200,
            'message' => 'Đã gỡ bỏ quyền truy cập trang khỏi vai trò thành công',
            'data' => $this->roleService->detachPages($id, $request->page_ids)
        ]);
    }

    /**
     * Xóa Vai trò
     */
    public function destroy($id): JsonResponse
    {
        try {
            $this->roleService->delete($id);
            return response()->json([
                'status' => 200,
                'message' => 'Xóa vai trò thành công'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}   