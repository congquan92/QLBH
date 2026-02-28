<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Service\RoleService;
use Illuminate\Http\Request;
use Exception;

class RoleController extends Controller
{
    protected $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    public function index(Request $request)
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort');
        $page = (int)$request->query('page', 1);
        $size = (int)$request->query('size', 10);

        return response()->json($this->roleService->findAll($keyword, $sort, $page, $size));
    }

    public function show($id)
    {
        return response()->json([
            'status' => 200,
            'data' => $this->roleService->getById($id)
        ]);
    }

    public function store(Request $request)
    {
        // Validation cơ bản (Nên dùng FormRequest để sạch code hơn)
        $data = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'group_permission_ids' => 'nullable|array',
            'description' => 'nullable|string'
        ]);

        return response()->json([
            'status' => 201,
            'message' => 'Tạo vai trò thành công',
            'data' => $this->roleService->create($data)
        ], 201);
    }

    public function update(Request $request, $id)
    {
        return response()->json([
            'status' => 200,
            'message' => 'Cập nhật vai trò thành công',
            'data' => $this->roleService->update($id, $request->all())
        ]);
    }

    /**
     * Gỡ bỏ các nhóm quyền khỏi vai trò
     */
    public function detachGroups(Request $request, $id)
    {
        $request->validate(['group_permission_ids' => 'required|array']);
        
        return response()->json([
            'status' => 200,
            'message' => 'Đã gỡ nhóm quyền khỏi vai trò thành công',
            'data' => $this->roleService->detachGroups($id, $request->group_permission_ids)
        ]);
    }

    public function destroy($id)
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