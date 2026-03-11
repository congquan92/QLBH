<?php

namespace App\Http\Controllers;

use App\Http\Service\ImportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ImportProductController extends Controller
{
    protected ImportService $importService;

    public function __construct(ImportService $importService)
    {
        $this->importService = $importService;
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->importService->findAll(
            $request->query('keyword'),
            $request->query('sort'),
            (int)$request->query('page', 1),
            (int)$request->query('size', 10),
            $request->query('timeRange'),
            $request->query('startDate'),
            $request->query('endDate'),
            $request->query('supplierId'),
            $request->query('deliveryStatus')
        );

        return response()->json($result);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'import_details' => 'required|array|min:1',
            'import_details.*.product_variant_id' => 'required|integer',
            'import_details.*.quantity' => 'required|integer|min:1',
            'import_details.*.unitPrice' => 'required|numeric|min:0',
        ]);

        $import = $this->importService->save($request->all());
        return response()->json(['message' => 'Tạo phiếu nhập thành công', 'data' => $import], 201);
    }

    public function confirm($id): JsonResponse
    {
        try {
            $this->importService->confirmImport((int)$id);
            return response()->json(['message' => 'Xác nhận nhập kho thành công']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function updateQuantities(Request $request, $id): JsonResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.importDetailId' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $this->importService->updateQuantityDetailFromPendingImport($request->items, (int)$id);
        return response()->json(['message' => 'Cập nhật số lượng thành công']);
    }

    public function cancel($id): JsonResponse
    {
        $this->importService->cancelImport((int)$id);
        return response()->json(['message' => 'Đã hủy phiếu nhập']);
    }

    public function destroy($id): JsonResponse
    {
        try {
            $this->importService->delete((int)$id);
            return response()->json(['message' => 'Xóa (ẩn) phiếu nhập thành công']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function show(int $id): JsonResponse
    {
        $import = $this->importService->getById($id);
        
        return response()->json([
            'status' => 200,
            'message' => 'Lấy thông tin phiếu nhập thành công',
            'data' => $import
        ]);
    }
}