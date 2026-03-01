<?php

namespace App\Http\Controllers;

use App\Http\Service\StatisticalService;
use Illuminate\Http\Request;

class StatisticalController extends Controller
{
    protected $statisticalService;

    public function __construct(StatisticalService $statisticalService)
    {
        $this->statisticalService = $statisticalService;
    }

    public function getActiveUser(Request $request)
    {
        $period = $request->query('period', 1);
        return response()->json($this->statisticalService->getActiveUserStatistics((int)$period));
    }

    public function getOrders(Request $request)
    {
        $period = $request->query('period', 1);
        return response()->json($this->statisticalService->getOrderStatistics((int)$period));
    }

    public function getRevenue12Months()
    {
        return response()->json($this->statisticalService->getRevenueCostProfit12Months());
    }

    public function getTopProducts(Request $request)
    {
        $period = $request->query('period', 1);
        $top = $request->query('top', 5);
        return response()->json($this->statisticalService->getTopProducts((int)$period, (int)$top));
    }

    public function getCategories(Request $request)
    {
        $period = $request->query('period', 1);
        return response()->json($this->statisticalService->getCategoryStatistics((int)$period));
    }
}