<?php

namespace App\Http\Service;

use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ImportProduct;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StatisticalService
{
    /**
     * Thống kê User Active và % tăng trưởng
     */
    public function getActiveUserStatistics(int $periodInMonths)
    {
        $now = Carbon::now();

        $startCurrent = $now->copy()->subMonths($periodInMonths);
        $endCurrent = $now;

        $startPrevious = $now->copy()->subMonths($periodInMonths * 2);
        $endPrevious = $now->copy()->subMonths($periodInMonths);

        $currentCount = User::where('status', 'ACTIVE')
            ->whereBetween('created_at', [$startCurrent, $endCurrent])
            ->count();

        $previousCount = User::where('status', 'ACTIVE')
            ->whereBetween('created_at', [$startPrevious, $endPrevious])
            ->count();

        return [
            'period' => $periodInMonths,
            'current' => $currentCount,
            'previous' => $previousCount,
            'percentChange' => $this->calculatePercentage($currentCount, $previousCount),
        ];
    }

    /**
     * Thống kê số lượng đơn hàng
     */
    public function getOrderStatistics(int $periodInMonths)
    {
        $now = Carbon::now();

        $startCurrent = $now->copy()->subMonths($periodInMonths);
        $startPrevious = $now->copy()->subMonths($periodInMonths * 2);

        $currentCount = Order::whereBetween('created_at', [$startCurrent, $now])->count();
        $previousCount = Order::whereBetween('created_at', [$startPrevious, $startCurrent])->count();

        return [
            'period' => $periodInMonths,
            'current' => $currentCount,
            'previous' => $previousCount,
            'percentChange' => $this->calculatePercentage($currentCount, $previousCount),
        ];
    }

    /**
     * Thống kê Doanh thu, Chi phí, Lợi nhuận 12 tháng trong năm
     */
    public function getRevenueCostProfit12Months()
    {
        $year = Carbon::now()->year;
        $revenueList = [];
        $costList = [];
        $profitList = [];

        for ($month = 1; $month <= 12; $month++) {
            // Doanh thu từ đơn hàng hoàn thành
            $revenue = Order::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->where('order_status', 'COMPLETED') // Giả định status
                ->sum('total_amount') ?: 0;

            // Chi phí từ nhập hàng hoàn thành
            $cost = ImportProduct::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->where('status', 'COMPLETED')
                ->sum('totalAmount') ?: 0;

            $profit = $revenue - $cost;

            $revenueList[] = $revenue;
            $costList[] = $cost;
            $profitList[] = $profit;
        }

        return [
            'year' => $year,
            'revenue' => $revenueList,
            'cost' => $costList,
            'profit' => $profitList,
        ];
    }

    /**
     * Top sản phẩm bán chạy và % so sánh kỳ trước
     */
    public function getTopProducts(int $periodInMonths, int $topN)
    {
        $now = Carbon::now();
        $startCurrent = $now->copy()->subMonths($periodInMonths);
        $startPrevious = $now->copy()->subMonths($periodInMonths * 2);

        // Top N hiện tại
        $currentTop = OrderItem::select('product_id', DB::raw('SUM(quantity) as totalSold'))
            ->whereBetween('created_at', [$startCurrent, $now])
            ->groupBy('product_id')
            ->orderByDesc('totalSold')
            ->limit($topN)
            ->get();

        $result = [];

        foreach ($currentTop as $item) {
            $prevSold = OrderItem::where('product_id', $item->product_id)
                ->whereBetween('created_at', [$startPrevious, $startCurrent])
                ->sum('quantity') ?: 0;

            $percentChange = $this->calculatePercentage($item->totalSold, $prevSold);

            $product = Product::find($item->product_id);
            if ($product) {
                $result[] = [
                    'productId' => $product->id,
                    'name' => $product->name,
                    'soldQuantity' => (int)$item->totalSold,
                    'percentChange' => $percentChange,
                    'listPrice' => $product->list_price,
                    'salePrice' => $product->sale_price,
                    'urlCoverImage' => $product->url_cover_image,
                ];
            }
        }

        return $result;
    }

    /**
     * Thống kê theo danh mục
     */
    public function getCategoryStatistics(int $periodInMonths)
    {
        $now = Carbon::now();
        $startCurrent = $now->copy()->subMonths($periodInMonths);
        $startPrevious = $now->copy()->subMonths($periodInMonths * 2);

        $currentData = OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name as categoryName', DB::raw('SUM(order_items.quantity) as totalQuantity'))
            ->whereBetween('order_items.created_at', [$startCurrent, $now])
            ->groupBy('categories.name')
            ->orderByDesc('totalQuantity')
            ->limit(4)
            ->get();

        $resultList = [];
        foreach ($currentData as $item) {
            $prevQty = OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
                ->join('categories', 'products.category_id', '=', 'categories.id')
                ->where('categories.name', $item->categoryName)
                ->whereBetween('order_items.created_at', [$startPrevious, $startCurrent])
                ->sum('order_items.quantity') ?: 0;

            $resultList[] = [
                'categoryName' => $item->categoryName,
                'quantity' => (int)$item->totalQuantity,
                'previousQuantity' => (int)$prevQty,
                'percentChange' => $this->calculatePercentage($item->totalQuantity, $prevQty),
            ];
        }

        return [
            'period' => $periodInMonths,
            'data' => $resultList
        ];
    }

    /**
     * Thống kê top khách hàng theo tổng mức mua trong kỳ
     */
    public function getTopCustomers(int $periodInMonths, int $topN = 5)
    {
        $now = Carbon::now();
        $startCurrent = $now->copy()->subMonths($periodInMonths);

        $orders = Order::with(['user:id,full_name,email,phone'])
            ->whereBetween('created_at', [$startCurrent, $now])
            ->where('order_status', '!=', 'CANCELLED')
            ->orderByDesc('created_at')
            ->get(['id', 'user_id', 'customer_name', 'customer_phone', 'total_amount', 'order_status', 'created_at']);

        $grouped = $orders->groupBy(function ($order) {
            if ($order->user_id) {
                return 'user_' . $order->user_id;
            }

            $guestKey = $order->customer_phone ?: strtolower(trim((string)$order->customer_name));
            return 'guest_' . ($guestKey ?: ('order_' . $order->id));
        });

        return $grouped
            ->map(function ($customerOrders) {
                $firstOrder = $customerOrders->first();
                $user = $firstOrder?->user;

                $totalPurchase = $customerOrders->sum(function ($order) {
                    return (float)$order->total_amount;
                });

                $orders = $customerOrders
                    ->sortByDesc('created_at')
                    ->map(function ($order) {
                        $status = $order->order_status;
                        $statusValue = $status instanceof \BackedEnum ? $status->value : (string)$status;

                        return [
                            'orderId' => (int)$order->id,
                            'totalAmount' => (float)$order->total_amount,
                            'orderStatus' => $statusValue,
                            'createdAt' => optional($order->created_at)->toISOString(),
                        ];
                    })
                    ->values();

                return [
                    'userId' => $firstOrder?->user_id ? (int)$firstOrder->user_id : null,
                    'customerName' => $user?->full_name ?: ($firstOrder?->customer_name ?? 'Khách lẻ'),
                    'customerPhone' => $user?->phone ?: ($firstOrder?->customer_phone ?? null),
                    'customerEmail' => $user?->email ?? null,
                    'totalPurchase' => round($totalPurchase, 2),
                    'orderCount' => $orders->count(),
                    'orders' => $orders,
                ];
            })
            ->sortByDesc('totalPurchase')
            ->take(max(1, $topN))
            ->values();
    }

    // Helper tính toán %
    private function calculatePercentage($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }
        return round((($current - $previous) / $previous) * 100, 2);
    }
}