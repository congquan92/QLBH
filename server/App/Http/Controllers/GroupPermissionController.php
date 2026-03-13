<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Service\GroupPermissionService;
use Illuminate\Http\Request;
use Exception;

class GroupPermissionController extends Controller
{
    protected $groupService;

    public function __construct(GroupPermissionService $groupService)
    {
        $this->groupService = $groupService;
    }

    public function index(Request $request)
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort');
        $page = (int)$request->query('page', 1);
        $size = (int)$request->query('size', 10);

        return response()->json($this->groupService->findAll($keyword, $sort, $page, $size));
    }

    public function show($id)
    {
        return response()->json([
            'status' => 200,
            'data' => $this->groupService->getById($id)
        ]);
    }

    public function store(Request $request)
    {
       $data = $request->validate([
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'url'            => 'nullable|string',
            'icon'           => 'nullable|string',
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,id'
        ]);

        return response()->json([
            'status' => 201,
            'message' => 'Tạo nhóm quyền thành công',
            'data' => $this->groupService->create($data)
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'name'           => 'nullable|string|max:255',
            'description'    => 'nullable|string',
            'url'            => 'nullable|string',
            'icon'           => 'nullable|string',
            'status'         => 'nullable|string',
            "page_id"        => 'nullable|exists:pages,id',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id'
        ]);
        return response()->json([
            'status' => 200,
            'message' => 'Cập nhật nhóm quyền thành công',
            'data' => $this->groupService->update($id, $data)
        ]);
    }

    /**
     * Gỡ bỏ các quyền lẻ khỏi nhóm
     */
    public function detachPermissions(Request $request, $id)
    {
        $request->validate(['permission_ids' => 'required|array']);

        return response()->json([
            'status' => 200,
            'message' => 'Đã gỡ quyền khỏi nhóm thành công',
            'data' => $this->groupService->detachPermissions($id, $request->permission_ids)
        ]);
    }

    public function destroy($id)
    {
        try {
            $this->groupService->delete($id);
            return response()->json([
                'status' => 200,
                'message' => 'Xóa nhóm quyền thành công'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}