<?php

namespace App\Http\Controllers;

use App\Http\Requests\Voucher\VoucherCreationRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Service\VoucherService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VoucherController extends Controller
{
    use ApiResponse;
    protected VoucherService $voucherService;

    public function __construct(VoucherService $voucherService)
    {
        $this->voucherService = $voucherService;
    }

    // Lấy danh sách cho User (Yêu cầu đăng nhập bên trong Service đã throw exception)
    public function findAll(Request $request): JsonResponse
    {
        $sort = $request->query('sort');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $result = $this->voucherService->findAll($sort, $page, $size);
        return $this->success($result, "Danh sách voucher cho người dùng");
    }

    // Lấy danh sách cho Admin
    public function findAllByAdmin(Request $request): JsonResponse
    {
        $result = $this->voucherService->findAllByAdmin(
            $request->query('keyword'),
            $request->query('rank'),
            $request->query('sort'),
            $request->query('timeStatus'),
            $request->query('startDate'),
            $request->query('endDate'),
            (int) $request->query('page', 1),
            (int) $request->query('size', 10)
        );
        return $this->success($result, "Danh sách voucher cho admnin");
    }

    public function store(VoucherCreationRequest $request): JsonResponse
    {
        $voucher = $this->voucherService->add($request);
        return $this->success($voucher, "Tạo voucher");
    }

    public function update(Request $request, $id): JsonResponse
    {
        $this->voucherService->update($id, $request->all());
        return $this->success(null, "Cập nhật voucher");
    }

    public function show($id): JsonResponse
    {
        $voucher = $this->voucherService->getVoucherById($id);
        return $this->success($voucher, "Xem chi tiết voucher");
    }
}