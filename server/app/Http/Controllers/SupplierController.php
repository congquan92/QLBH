<?php

namespace App\Http\Controllers;


use App\Enums\Status;
use App\Http\Requests\Supplier\SupplierCreationRequest;
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

    public function update(Request $request, $id): JsonResponse
    {
        // Bạn có thể tạo SupplierUpdateRequest nếu cần validate phức tạp hơn
        $supplier = $this->supplierService->update($id, $request->all());
        return response()->json([
            'message' => 'Cập nhật thành công',
            'data' => $supplier
        ]);
    }

    public function destroy($id): JsonResponse
    {
        // Chuyển sang DISABLED (Xóa mềm bằng trạng thái)
        $this->supplierService->update($id, ['status' => Status::DISABLED]);
        return response()->json(['message' => 'Đã vô hiệu hóa nhà cung cấp']);
    }
}