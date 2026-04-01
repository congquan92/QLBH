<?php

namespace App\Http\Controllers;


use App\Enums\Status;
use App\Http\Requests\Supplier\SupplierCreationRequest;
use App\Http\Requests\Supplier\SupplierUpdateRequest;
use App\Http\Service\SupplierService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SupplierController extends Controller
{
    protected SupplierService $supplierService;

    public function __construct(SupplierService $supplierService)
    {
        $this->supplierService = $supplierService;
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->supplierService->findAll(
            $request->query('keyword'),
            $request->query('sort'),
            $request->query('status'),
            (int)$request->query('page', 1),
            (int)$request->query('size', 10)
        );
        return response()->json($result);
    }

    public function store(SupplierCreationRequest $request): void
    {
        $this->supplierService->create($request);
    }

    public function show($id): JsonResponse
    {
        $supplier = $this->supplierService->getSupplierById($id);
        return response()->json($supplier);
    }

    public function update(SupplierUpdateRequest $request, $id): JsonResponse
    {
        $supplier = $this->supplierService->update($id, $request->validated());
        return response()->json([
            'message' => 'Cập nhật thành công',
            'data' => $supplier
        ]);
    }

    public function destroy($id): JsonResponse
    {
        // Xóa mềm: chuyển sang INACTIVE để vẫn có thể khôi phục lại.
        $this->supplierService->update($id, ['status' => Status::INACTIVE]);
        return response()->json(['message' => 'Đã tạm ngừng nhà cung cấp']);
    }
}