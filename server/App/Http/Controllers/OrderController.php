<?php

namespace App\Http\Controllers;

use App\Http\Requests\orders\OrderCreationRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Service\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ApiResponse;
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function findAll(Request $request)
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $deliveryStatus = $request->query('deliveryStatus');

        $result = $this->orderService->findAllByUser(
            $keyword,
            $sort,
            $page,
            $size,
            $startDate,
            $endDate,
            $deliveryStatus
        );
        return $this->success($result, 'Order me list fetched successfully');
    }
    public function findAllByAdmin(Request $request)
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $deliveryStatus = $request->query('deliveryStatus');
        $deliveryDistrict = $request->query('deliveryDistrict');
        $deliveryProvince = $request->query('deliveryProvince');
        $deliveryWard = $request->query('deliveryWard');

        $result = $this->orderService->findAllByAdmin(
            $keyword,
            $sort,
            $page,
            $size,
            $startDate,
            $endDate,
            $deliveryStatus,
            $deliveryDistrict,
            $deliveryProvince,
            $deliveryWard
        );
        return $this->success($result, 'Order all list fetched successfully');
    }

  
    public function store(OrderCreationRequest $request)
    {
        $this->orderService->create($request);
    }

    public function updateStatus($id, Request $request)
    {
        $status = $request->input('status');
        $this->orderService->changeStatus($id, $status);
        return $this->success([], 'Order status updated successfully');
    }

    public function completeOrder($id){
        $this->orderService->completeOrder($id);
        return $this->success([], 'Order completed successfully');
    }

    public function getOrderById($id){
        $result = $this->orderService->getOrderById($id);
        return $this->success($result,"Get by id user");
    }

    public function getOrderByIdForAdmin($id){
        $result = $this->orderService->getOrderByIdForAdmin($id);
         return $this->success($result,"Get by id user");
    }

    public function cancelOrder($id){
        $this->orderService->cancelOrder($id);
        return $this->success([], 'Order cancelled successfully');
    }
}
