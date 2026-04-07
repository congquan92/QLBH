<?php

namespace App\Http\Service;

use App\Models\Attendance;
use App\Models\Bonus;
use App\Models\ImportProduct;
use App\Models\JobHistory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use BackedEnum;
use Illuminate\Support\Facades\DB;

class StatisticalService
{
    protected SalaryService $salaryService;

    public function __construct(SalaryService $salaryService)
    {
        $this->salaryService = $salaryService;
    }

    /**
     * Thống kê User Active và % tăng trưởng (legacy)
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
     * Thống kê số lượng đơn hàng (legacy)
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
     * Thống kê Doanh thu, Chi phí, Lợi nhuận 12 tháng trong năm (legacy)
     */
    public function getRevenueCostProfit12Months()
    {
        $year = Carbon::now()->year;
        $revenueList = [];
        $costList = [];
        $profitList = [];

        for ($month = 1; $month <= 12; $month++) {
            $revenue = Order::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->where('order_status', 'COMPLETED')
                ->sum('total_amount') ?: 0;

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
     * Top sản phẩm bán chạy và % so sánh kỳ trước (legacy)
     */
    public function getTopProducts(int $periodInMonths, int $topN)
    {
        $now = Carbon::now();
        $startCurrent = $now->copy()->subMonths($periodInMonths);
        $startPrevious = $now->copy()->subMonths($periodInMonths * 2);

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
                    'soldQuantity' => (int) $item->totalSold,
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
     * Thống kê theo danh mục (legacy)
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
                'quantity' => (int) $item->totalQuantity,
                'previousQuantity' => (int) $prevQty,
                'percentChange' => $this->calculatePercentage($item->totalQuantity, $prevQty),
            ];
        }

        return [
            'period' => $periodInMonths,
            'data' => $resultList,
        ];
    }

    /**
     * Thống kê top khách hàng theo tổng mức mua trong kỳ (legacy)
     */
    public function getTopCustomers(int $periodInMonths, int $topN = 5)
    {
        $now = Carbon::now();
        $startCurrent = $now->copy()->subMonths($periodInMonths);

        $orders = Order::with(['user:id,full_name,email,phone'])
            ->whereBetween('created_at', [$startCurrent, $now])
            ->where('order_status', 'COMPLETED')
            ->where('payment_status', 'PAID')
            ->orderByDesc('created_at')
            ->get(['id', 'user_id', 'customer_name', 'customer_phone', 'total_amount', 'order_status', 'created_at']);

        $grouped = $orders->groupBy(function ($order) {
            if ($order->user_id) {
                return 'user_' . $order->user_id;
            }

            $guestKey = $order->customer_phone ?: strtolower(trim((string) $order->customer_name));
            return 'guest_' . ($guestKey ?: ('order_' . $order->id));
        });

        return $grouped
            ->map(function ($customerOrders) {
                $firstOrder = $customerOrders->first();
                $user = $firstOrder?->user;

                $totalPurchase = $customerOrders->sum(function ($order) {
                    return (float) $order->total_amount;
                });

                $orders = $customerOrders
                    ->sortByDesc('created_at')
                    ->map(function ($order) {
                        $status = $order->order_status;
                        $statusValue = $status instanceof \BackedEnum ? $status->value : (string) $status;

                        return [
                            'orderId' => (int) $order->id,
                            'totalAmount' => (float) $order->total_amount,
                            'orderStatus' => $statusValue,
                            'createdAt' => optional($order->created_at)->toISOString(),
                        ];
                    })
                    ->values();

                return [
                    'userId' => $firstOrder?->user_id ? (int) $firstOrder->user_id : null,
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

    public function getOverviewStatistics(string $periodType, ?int $year = null, ?int $month = null, ?int $quarter = null): array
    {
        $range = $this->resolveRange($periodType, $year, $month, $quarter);

        $revenue = (float) Order::whereBetween('created_at', [$range['start'], $range['end']])
            ->where('order_status', 'COMPLETED')
            ->sum('total_amount');

        $cost = (float) ImportProduct::whereBetween('created_at', [$range['start'], $range['end']])
            ->where('status', 'COMPLETED')
            ->sum('totalAmount');

        $orders = (int) Order::whereBetween('created_at', [$range['start'], $range['end']])
            ->where('order_status', '!=', 'CANCELLED')
            ->count();

        $newUsers = (int) User::whereBetween('created_at', [$range['start'], $range['end']])->count();

        $topProducts = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereBetween('orders.created_at', [$range['start'], $range['end']])
            ->where('orders.order_status', 'COMPLETED')
            ->select(
                'products.id as product_id',
                'products.name as product_name',
                DB::raw('SUM(order_items.quantity) as quantity'),
                DB::raw('SUM(order_items.quantity * order_items.final_price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('quantity')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => (int) $item->product_id,
                    'product_name' => (string) $item->product_name,
                    'quantity' => (int) $item->quantity,
                    'total_revenue' => (float) $item->total_revenue,
                ];
            })
            ->values();

        $categorySales = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereBetween('orders.created_at', [$range['start'], $range['end']])
            ->where('orders.order_status', 'COMPLETED')
            ->select(
                'categories.id as category_id',
                'categories.name as category_name',
                DB::raw('SUM(order_items.quantity) as sold_quantity')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('sold_quantity')
            ->get();

        $totalCategoryQuantity = (float) $categorySales->sum('sold_quantity');
        $categoryBreakdown = $categorySales
            ->map(function ($item) use ($totalCategoryQuantity) {
                $qty = (float) $item->sold_quantity;
                return [
                    'category_id' => (int) $item->category_id,
                    'category_name' => (string) $item->category_name,
                    'sold_quantity' => (int) $qty,
                    'percentage' => $totalCategoryQuantity > 0 ? round(($qty / $totalCategoryQuantity) * 100, 2) : 0,
                ];
            })
            ->values();

        $topCustomers = $this->getTopCustomersByDateRange($range['start'], $range['end']);

        return [
            'period_type' => $periodType,
            'period_label' => $range['label'],
            'start_date' => $range['start']->toDateString(),
            'end_date' => $range['end']->toDateString(),
            'revenue' => $revenue,
            'cost' => $cost,
            'profit' => $revenue - $cost,
            'orders' => $orders,
            'new_users' => $newUsers,
            'top_products' => $topProducts,
            'category_breakdown' => $categoryBreakdown,
            'top_customers' => $topCustomers,
        ];
    }

    public function getWorkforceStatistics(string $periodType, ?int $year = null, ?int $month = null, ?int $quarter = null): array
    {
        $range = $this->resolveRange($periodType, $year, $month, $quarter);

        $staffQuery = $this->staffQuery();

        $totalEmployees = (clone $staffQuery)->count();
        $activeEmployees = (clone $staffQuery)->where('users.status', 'ACTIVE')->count();
        $inactiveEmployees = (clone $staffQuery)->where('users.status', 'INACTIVE')->count();
        $newEmployees = (clone $staffQuery)->whereBetween('users.created_at', [$range['start'], $range['end']])->count();

        $approvedLeaveDays = (int) DB::table('leave_requests')
            ->join('users', 'leave_requests.user_id', '=', 'users.id')
            ->join('roles', 'users.role_id', '=', 'roles.id')
            ->where('roles.name', '!=', 'USER')
            ->where('leave_requests.status', 'APPROVED')
            ->whereBetween('leave_requests.leave_date', [$range['start']->toDateString(), $range['end']->toDateString()])
            ->count();

        $attendanceSummary = Attendance::join('users', 'attendances.user_id', '=', 'users.id')
            ->join('roles', 'users.role_id', '=', 'roles.id')
            ->where('roles.name', '!=', 'USER')
            ->whereBetween('attendances.date', [$range['start']->toDateString(), $range['end']->toDateString()])
            ->select('attendances.status', DB::raw('COUNT(*) as total'))
            ->groupBy('attendances.status')
            ->get()
            ->map(function ($item) {
                $status = $item->status;
                if ($status instanceof BackedEnum) {
                    $status = $status->value;
                }

                return [
                    'status' => (string) $status,
                    'total' => (int) $item->total,
                ];
            })
            ->values();

        $positionBreakdown = User::join('roles', 'users.role_id', '=', 'roles.id')
            ->leftJoin('positions', 'users.position_id', '=', 'positions.id')
            ->where('roles.name', '!=', 'USER')
            ->select(DB::raw("COALESCE(positions.name, 'Chưa gán chức vụ') as position_name"), DB::raw('COUNT(users.id) as total'))
            ->groupBy('position_name')
            ->orderByDesc('total')
            ->get()
            ->map(function ($item) {
                return [
                    'position_name' => (string) $item->position_name,
                    'total' => (int) $item->total,
                ];
            })
            ->values();

        $employmentBreakdown = JobHistory::join('users', 'job_histories.user_id', '=', 'users.id')
            ->join('roles', 'users.role_id', '=', 'roles.id')
            ->where('roles.name', '!=', 'USER')
            ->where(function ($query) {
                $query->whereNull('job_histories.end_date')
                    ->orWhere('job_histories.end_date', '>=', now()->toDateString());
            })
            ->select('job_histories.employment_type', DB::raw('COUNT(job_histories.id) as total'))
            ->groupBy('job_histories.employment_type')
            ->orderByDesc('total')
            ->get()
            ->map(function ($item) {
                $employmentType = $item->employment_type;
                if ($employmentType instanceof BackedEnum) {
                    $employmentType = $employmentType->value;
                }

                return [
                    'employment_type' => (string) $employmentType,
                    'total' => (int) $item->total,
                ];
            })
            ->values();

        return [
            'period_type' => $periodType,
            'period_label' => $range['label'],
            'start_date' => $range['start']->toDateString(),
            'end_date' => $range['end']->toDateString(),
            'summary' => [
                'total_employees' => (int) $totalEmployees,
                'active_employees' => (int) $activeEmployees,
                'inactive_employees' => (int) $inactiveEmployees,
                'new_employees' => (int) $newEmployees,
                'approved_leave_days' => $approvedLeaveDays,
            ],
            'attendance_summary' => $attendanceSummary,
            'position_breakdown' => $positionBreakdown,
            'employment_breakdown' => $employmentBreakdown,
        ];
    }

    public function getSalaryStatistics(string $periodType, ?int $year = null, ?int $month = null, ?int $quarter = null): array
    {
        $range = $this->resolveRange($periodType, $year, $month, $quarter);

        $months = [];
        $cursor = $range['start']->copy()->startOfMonth();
        $lastMonth = $range['end']->copy()->startOfMonth();
        while ($cursor->lte($lastMonth)) {
            $months[] = [
                'month' => (int) $cursor->month,
                'year' => (int) $cursor->year,
            ];
            $cursor->addMonth();
        }

        $employees = $this->staffQuery()->select('users.id', 'users.full_name')->get();

        $totalBase = 0.0;
        $totalHolidayBonus = 0.0;
        $totalManualBonus = 0.0;
        $totalFinal = 0.0;
        $failedRecords = 0;
        $successRecords = 0;
        $employeeTotals = [];

        foreach ($employees as $employee) {
            $employeeTotal = 0.0;

            foreach ($months as $item) {
                try {
                    $salary = $this->salaryService->calculateMonthlySalary($employee->id, $item['month'], $item['year']);
                    $totalBase += (float) ($salary['base_salary'] ?? 0);
                    $totalHolidayBonus += (float) ($salary['total_holiday_bonus'] ?? 0);
                    $totalManualBonus += (float) ($salary['total_manual_bonus'] ?? 0);
                    $totalFinal += (float) ($salary['final_salary'] ?? 0);
                    $employeeTotal += (float) ($salary['final_salary'] ?? 0);
                    $successRecords++;
                } catch (\Throwable $th) {
                    $failedRecords++;
                }
            }

            if ($employeeTotal > 0) {
                $employeeTotals[] = [
                    'user_id' => (int) $employee->id,
                    'employee_name' => (string) $employee->full_name,
                    'total_salary' => round($employeeTotal, 0),
                ];
            }
        }

        $topEmployees = collect($employeeTotals)
            ->sortByDesc('total_salary')
            ->take(10)
            ->values();

        $bonusRows = Bonus::join('users', 'bonuses.user_id', '=', 'users.id')
            ->join('roles', 'users.role_id', '=', 'roles.id')
            ->where('roles.name', '!=', 'USER')
            ->where(function ($q) use ($range) {
                $q->whereBetween('bonuses.created_at', [$range['start'], $range['end']])
                    ->orWhere(function ($q2) use ($range) {
                        $q2->whereRaw('(bonuses.year * 100 + bonuses.month) >= ?', [((int) $range['start']->year * 100) + (int) $range['start']->month])
                            ->whereRaw('(bonuses.year * 100 + bonuses.month) <= ?', [((int) $range['end']->year * 100) + (int) $range['end']->month]);
                    });
            })
            ->select('bonuses.id', 'bonuses.type', 'bonuses.reason', 'bonuses.amount', 'bonuses.month', 'bonuses.year', 'bonuses.created_at', 'users.id as user_id', 'users.full_name as employee_name')
            ->orderByDesc('bonuses.created_at')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => (int) $item->id,
                    'type' => (string) $item->type,
                    'reason' => (string) ($item->reason ?? ''),
                    'amount' => (float) $item->amount,
                    'month' => (int) $item->month,
                    'year' => (int) $item->year,
                    'created_at' => optional($item->created_at)?->toISOString(),
                    'user_id' => (int) $item->user_id,
                    'employee_name' => (string) $item->employee_name,
                ];
            });

        $bonusByType = $bonusRows
            ->groupBy('type')
            ->map(function ($item) {
                $recipients = collect($item)
                    ->groupBy('user_id')
                    ->map(function ($recipientRows) {
                        $first = collect($recipientRows)->first();
                        $bonusItems = collect($recipientRows)
                            ->map(function ($row) {
                                return [
                                    'id' => (int) $row['id'],
                                    'amount' => (float) $row['amount'],
                                    'reason' => (string) ($row['reason'] ?? ''),
                                    'bonus_type' => (string) ($row['type'] ?? ''),
                                    'month' => (int) ($row['month'] ?? 0),
                                    'year' => (int) ($row['year'] ?? 0),
                                    'created_at' => $row['created_at'] ?? null,
                                ];
                            })
                            ->values();

                        return [
                            'user_id' => (int) ($first['user_id'] ?? 0),
                            'employee_name' => (string) ($first['employee_name'] ?? ''),
                            'total_amount' => (float) collect($recipientRows)->sum('amount'),
                            'bonus_items' => $bonusItems,
                        ];
                    })
                    ->sortByDesc('total_amount')
                    ->values();

                return [
                    'type' => (string) collect($item)->first()['type'],
                    'total_amount' => (float) collect($item)->sum('amount'),
                    'recipients' => $recipients,
                ];
            })
            ->sortByDesc('total_amount')
            ->values();

        return [
            'period_type' => $periodType,
            'period_label' => $range['label'],
            'start_date' => $range['start']->toDateString(),
            'end_date' => $range['end']->toDateString(),
            'summary' => [
                'total_base_salary' => round($totalBase, 0),
                'total_holiday_bonus' => round($totalHolidayBonus, 0),
                'total_manual_bonus' => round($totalManualBonus, 0),
                'total_final_salary' => round($totalFinal, 0),
                'average_salary' => $successRecords > 0 ? round($totalFinal / $successRecords, 0) : 0,
                'record_count' => $successRecords,
                'failed_record_count' => $failedRecords,
                'employee_count' => (int) $employees->count(),
            ],
            'top_employees' => $topEmployees,
            'bonus_by_type' => $bonusByType,
        ];
    }

    public function getProductExportStatistics(string $periodType, ?int $year = null, ?int $month = null, ?int $quarter = null): array
    {
        $range = $this->resolveRange($periodType, $year, $month, $quarter);

        $baseQuery = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->leftJoin('products', 'order_items.product_id', '=', 'products.id')
            ->whereBetween('orders.created_at', [$range['start'], $range['end']])
            ->where('orders.order_status', 'COMPLETED')
            ->where('orders.payment_status', 'PAID');

        $totalQuantity = (int) (clone $baseQuery)->sum('order_items.quantity');
        $totalRevenue = (float) (clone $baseQuery)->sum(DB::raw('order_items.quantity * order_items.final_price'));

        $topProducts = (clone $baseQuery)
            ->select(
                DB::raw('COALESCE(products.id, 0) as product_id'),
                DB::raw("COALESCE(products.name, 'Sản phẩm đã xoá') as product_name"),
                DB::raw('SUM(order_items.quantity) as quantity'),
                DB::raw('SUM(order_items.quantity * order_items.final_price) as revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('quantity')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => (int) $item->product_id,
                    'product_name' => (string) $item->product_name,
                    'quantity' => (int) $item->quantity,
                    'revenue' => (float) $item->revenue,
                ];
            })
            ->values();

        if ($periodType === 'month') {
            $trend = (clone $baseQuery)
                ->select(
                    DB::raw('DATE(orders.created_at) as period_key'),
                    DB::raw('SUM(order_items.quantity) as quantity')
                )
                ->groupBy('period_key')
                ->orderBy('period_key')
                ->get()
                ->map(function ($item) {
                    return [
                        'label' => Carbon::parse($item->period_key)->format('d/m'),
                        'quantity' => (int) $item->quantity,
                    ];
                })
                ->values();
        } else {
            $trend = (clone $baseQuery)
                ->select(
                    DB::raw("DATE_FORMAT(orders.created_at, '%Y-%m') as period_key"),
                    DB::raw('SUM(order_items.quantity) as quantity')
                )
                ->groupBy('period_key')
                ->orderBy('period_key')
                ->get()
                ->map(function ($item) {
                    return [
                        'label' => Carbon::createFromFormat('Y-m', $item->period_key)->format('m/Y'),
                        'quantity' => (int) $item->quantity,
                    ];
                })
                ->values();
        }

        return [
            'period_type' => $periodType,
            'period_label' => $range['label'],
            'start_date' => $range['start']->toDateString(),
            'end_date' => $range['end']->toDateString(),
            'summary' => [
                'total_export_quantity' => $totalQuantity,
                'total_export_revenue' => round($totalRevenue, 0),
                'product_count' => (int) $topProducts->count(),
            ],
            'top_products' => $topProducts,
            'trend' => $trend,
        ];
    }

    public function buildReportForSection(string $section, string $periodType, ?int $year = null, ?int $month = null, ?int $quarter = null): array
    {
        if ($section === 'overview') {
            $data = $this->getOverviewStatistics($periodType, $year, $month, $quarter);
            $rows = [
                ['Tong quan', 'Doanh thu', round($data['revenue'], 0), 'Don da hoan tat trong ky'],
                ['Tong quan', 'Chi phi', round($data['cost'], 0), 'Chi phi nhap hang'],
                ['Tong quan', 'Loi nhuan', round($data['profit'], 0), 'Doanh thu - Chi phi'],
                ['Tong quan', 'Don hang', (int) $data['orders'], 'So don trong ky'],
                ['Tong quan', 'Nguoi dung moi', (int) $data['new_users'], 'Tai khoan tao moi'],
            ];

            foreach (($data['category_breakdown'] ?? []) as $item) {
                $rows[] = [
                    'Ty trong danh muc',
                    (string) ($item['category_name'] ?? '-'),
                    (string) ($item['percentage'] ?? 0) . '%',
                    'So luong ban: ' . (string) ($item['sold_quantity'] ?? 0),
                ];
            }

            foreach (($data['top_customers'] ?? []) as $customer) {
                $rows[] = [
                    'Top khach hang',
                    (string) ($customer['customerName'] ?? '-'),
                    round((float) ($customer['totalPurchase'] ?? 0), 0),
                    'So don: ' . (string) ($customer['orderCount'] ?? 0),
                ];

                foreach (($customer['orders'] ?? []) as $order) {
                    $rows[] = [
                        'Lich su don top khach',
                        'Don #' . (string) ($order['orderId'] ?? '-'),
                        round((float) ($order['totalAmount'] ?? 0), 0),
                        (string) ($order['orderStatus'] ?? '-') . ' | ' . (string) ($order['createdAt'] ?? '-'),
                    ];
                }
            }

            return [
                'title' => 'Bao cao thong ke tong quan',
                'meta' => [
                    'Ky bao cao' => $data['period_label'],
                    'Tu ngay' => $data['start_date'],
                    'Den ngay' => $data['end_date'],
                ],
                'headers' => ['Nhom', 'Muc', 'Gia tri', 'Ghi chu'],
                'rows' => $rows,
                'file_name' => 'bao-cao-tong-quan',
            ];
        }

        if ($section === 'workforce') {
            $data = $this->getWorkforceStatistics($periodType, $year, $month, $quarter);
            $summary = $data['summary'];
            $rows = [
                ['Tong hop nhan su', 'Tong nhan su', $summary['total_employees'], ''],
                ['Tong hop nhan su', 'Dang hoat dong', $summary['active_employees'], ''],
                ['Tong hop nhan su', 'Tam nghi', $summary['inactive_employees'], ''],
                ['Tong hop nhan su', 'Nhan su moi', $summary['new_employees'], ''],
                ['Tong hop nhan su', 'Ngay nghi phep duoc duyet', $summary['approved_leave_days'], ''],
            ];

            foreach (($data['position_breakdown'] ?? []) as $item) {
                $rows[] = ['Theo chuc vu', (string) ($item['position_name'] ?? '-'), (int) ($item['total'] ?? 0), ''];
            }

            foreach (($data['employment_breakdown'] ?? []) as $item) {
                $rows[] = ['Theo loai nhan su', (string) ($item['employment_type'] ?? '-'), (int) ($item['total'] ?? 0), ''];
            }

            foreach (($data['attendance_summary'] ?? []) as $item) {
                $rows[] = ['Theo cham cong', (string) ($item['status'] ?? '-'), (int) ($item['total'] ?? 0), ''];
            }

            return [
                'title' => 'Bao cao nhan su',
                'meta' => [
                    'Ky bao cao' => $data['period_label'],
                    'Tu ngay' => $data['start_date'],
                    'Den ngay' => $data['end_date'],
                ],
                'headers' => ['Nhom', 'Muc', 'Gia tri', 'Ghi chu'],
                'rows' => $rows,
                'file_name' => 'bao-cao-nhan-su',
            ];
        }

        if ($section === 'salary') {
            $data = $this->getSalaryStatistics($periodType, $year, $month, $quarter);
            $summary = $data['summary'];
            $rows = [
                ['Tong hop luong', 'Tong luong co ban', $summary['total_base_salary'], ''],
                ['Tong hop luong', 'Tong thuong le', $summary['total_holiday_bonus'], ''],
                ['Tong hop luong', 'Tong thuong thu cong', $summary['total_manual_bonus'], ''],
                ['Tong hop luong', 'Tong luong thuc nhan', $summary['total_final_salary'], ''],
                ['Tong hop luong', 'Luong trung binh/ban ghi', $summary['average_salary'], ''],
                ['Tong hop luong', 'So ban ghi thanh cong', $summary['record_count'], ''],
                ['Tong hop luong', 'So ban ghi loi', $summary['failed_record_count'], ''],
            ];

            foreach (($data['bonus_by_type'] ?? []) as $bonusType) {
                $rows[] = [
                    'Thuong theo loai',
                    (string) ($bonusType['type'] ?? 'Khac'),
                    round((float) ($bonusType['total_amount'] ?? 0), 0),
                    'Tong thuong theo loai',
                ];

                foreach (($bonusType['recipients'] ?? []) as $recipient) {
                    $rows[] = [
                        'Nguoi nhan thuong',
                        (string) ($recipient['employee_name'] ?? '-'),
                        round((float) ($recipient['total_amount'] ?? 0), 0),
                        'Loai: ' . (string) ($bonusType['type'] ?? '-'),
                    ];

                    foreach (($recipient['bonus_items'] ?? []) as $item) {
                        $rows[] = [
                            'Chi tiet thuong',
                            'Khoan #' . (string) ($item['id'] ?? '-'),
                            round((float) ($item['amount'] ?? 0), 0),
                            'Ly do: ' . (string) ($item['reason'] ?? '-') . ' | Loai: ' . (string) ($item['bonus_type'] ?? '-') . ' | ' . (string) ($item['month'] ?? '-') . '/' . (string) ($item['year'] ?? '-'),
                        ];
                    }
                }
            }

            return [
                'title' => 'Bao cao luong',
                'meta' => [
                    'Ky bao cao' => $data['period_label'],
                    'Tu ngay' => $data['start_date'],
                    'Den ngay' => $data['end_date'],
                ],
                'headers' => ['Nhom', 'Muc', 'Gia tri', 'Ghi chu'],
                'rows' => $rows,
                'file_name' => 'bao-cao-luong',
            ];
        }

        $data = $this->getProductExportStatistics($periodType, $year, $month, $quarter);
        $summary = $data['summary'];

        return [
            'title' => 'Bao cao san pham xuat',
            'meta' => [
                'Ky bao cao' => $data['period_label'],
                'Tu ngay' => $data['start_date'],
                'Den ngay' => $data['end_date'],
            ],
            'headers' => ['Nhom', 'Muc', 'Gia tri', 'Ghi chu'],
            'rows' => array_merge(
                [
                    ['Tong hop xuat', 'Tong so luong da xuat', $summary['total_export_quantity'], 'Don hoan tat va da thanh toan'],
                    ['Tong hop xuat', 'Tong doanh thu xuat', $summary['total_export_revenue'], ''],
                    ['Tong hop xuat', 'So san pham co trong top', $summary['product_count'], ''],
                ],
                collect($data['top_products'] ?? [])->map(function ($item) {
                    return ['Top san pham', (string) ($item['product_name'] ?? '-'), (int) ($item['quantity'] ?? 0), 'Doanh thu: ' . round((float) ($item['revenue'] ?? 0), 0)];
                })->values()->all(),
                collect($data['trend'] ?? [])->map(function ($item) {
                    return ['Xu huong xuat', (string) ($item['label'] ?? '-'), (int) ($item['quantity'] ?? 0), ''];
                })->values()->all()
            ),
            'file_name' => 'bao-cao-xuat-san-pham',
        ];
    }

    private function resolveRange(string $periodType, ?int $year = null, ?int $month = null, ?int $quarter = null): array
    {
        $now = Carbon::now();
        $type = strtolower($periodType);

        if ($type === 'year') {
            $useYear = $year ?: (int) $now->year;
            $start = Carbon::create($useYear, 1, 1)->startOfDay();
            $end = Carbon::create($useYear, 12, 31)->endOfDay();
            return [
                'start' => $start,
                'end' => $end,
                'label' => "Nam {$useYear}",
            ];
        }

        if ($type === 'quarter') {
            $useYear = $year ?: (int) $now->year;
            $useQuarter = $quarter ?: (int) ceil($now->month / 3);
            $useQuarter = max(1, min(4, $useQuarter));
            $startMonth = ($useQuarter - 1) * 3 + 1;
            $start = Carbon::create($useYear, $startMonth, 1)->startOfDay();
            $end = $start->copy()->addMonths(2)->endOfMonth()->endOfDay();
            return [
                'start' => $start,
                'end' => $end,
                'label' => "Quy {$useQuarter}/{$useYear}",
            ];
        }

        $useYear = $year ?: (int) $now->year;
        $useMonth = $month ?: (int) $now->month;
        $useMonth = max(1, min(12, $useMonth));

        $start = Carbon::create($useYear, $useMonth, 1)->startOfDay();
        $end = $start->copy()->endOfMonth()->endOfDay();

        return [
            'start' => $start,
            'end' => $end,
            'label' => "Thang {$useMonth}/{$useYear}",
        ];
    }

    private function staffQuery()
    {
        return User::query()
            ->join('roles', 'users.role_id', '=', 'roles.id')
            ->where('roles.name', '!=', 'USER');
    }

    private function calculatePercentage($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }
        return round((($current - $previous) / $previous) * 100, 2);
    }

    private function getTopCustomersByDateRange(Carbon $start, Carbon $end, int $topN = 8)
    {
        $orders = Order::with(['user:id,full_name,email,phone'])
            ->whereBetween('created_at', [$start, $end])
            ->where('order_status', 'COMPLETED')
            ->where('payment_status', 'PAID')
            ->orderByDesc('created_at')
            ->get(['id', 'user_id', 'customer_name', 'customer_phone', 'total_amount', 'order_status', 'created_at']);

        $grouped = $orders->groupBy(function ($order) {
            if ($order->user_id) {
                return 'user_' . $order->user_id;
            }

            $guestKey = $order->customer_phone ?: strtolower(trim((string) $order->customer_name));
            return 'guest_' . ($guestKey ?: ('order_' . $order->id));
        });

        return $grouped
            ->map(function ($customerOrders) {
                $firstOrder = $customerOrders->first();
                $user = $firstOrder?->user;

                $totalPurchase = $customerOrders->sum(function ($order) {
                    return (float) $order->total_amount;
                });

                $orders = $customerOrders
                    ->sortByDesc('created_at')
                    ->map(function ($order) {
                        $status = $order->order_status;
                        $statusValue = $status instanceof BackedEnum ? $status->value : (string) $status;

                        return [
                            'orderId' => (int) $order->id,
                            'totalAmount' => (float) $order->total_amount,
                            'orderStatus' => $statusValue,
                            'createdAt' => optional($order->created_at)->toISOString(),
                        ];
                    })
                    ->values();

                return [
                    'userId' => $firstOrder?->user_id ? (int) $firstOrder->user_id : null,
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
}
