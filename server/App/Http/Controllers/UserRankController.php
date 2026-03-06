<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRank\UserRankCreationRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Service\UserRankService;
use App\Models\UserRank;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserRankController extends Controller
{
use ApiResponse;
    protected UserRankService $userRankService;

    public function __construct(UserRankService $userRankService)
    {
        $this->userRankService = $userRankService;
    }

    public function findAll(Request $request): JsonResponse
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort','min_spent:desc');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $result = $this->userRankService->findAll($keyword,$sort, $page, $size);
        return $this->success($result, "Danh sách hạng người dùng");
    }

     public function store(UserRankCreationRequest $request): JsonResponse
    {
        $voucher = $this->userRankService->create($request);
        return $this->success($voucher, "Tạo hạng người dùng");
    }

    public function update(Request $request, $id): JsonResponse
    {
        $this->userRankService->update($id, $request->all());
        return $this->success(null, "Cập nhật hạng người dùng");
    }
}
