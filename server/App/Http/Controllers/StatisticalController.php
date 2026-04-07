<?php

namespace App\Http\Controllers;

use App\Exports\SimpleReportExport;
use App\Http\Service\StatisticalService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

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

    public function getTopCustomers(Request $request)
    {
        $period = $request->query('period', 1);
        $top = $request->query('top', 5);
        return response()->json($this->statisticalService->getTopCustomers((int)$period, (int)$top));
    }

    public function getOverview(Request $request)
    {
        $periodType = (string) $request->query('period_type', 'month');
        $year = $request->query('year');
        $month = $request->query('month');
        $quarter = $request->query('quarter');

        return response()->json(
            $this->statisticalService->getOverviewStatistics(
                $periodType,
                $year !== null ? (int) $year : null,
                $month !== null ? (int) $month : null,
                $quarter !== null ? (int) $quarter : null,
            )
        );
    }

    public function getWorkforce(Request $request)
    {
        $periodType = (string) $request->query('period_type', 'month');
        $year = $request->query('year');
        $month = $request->query('month');
        $quarter = $request->query('quarter');

        return response()->json(
            $this->statisticalService->getWorkforceStatistics(
                $periodType,
                $year !== null ? (int) $year : null,
                $month !== null ? (int) $month : null,
                $quarter !== null ? (int) $quarter : null,
            )
        );
    }

    public function getSalaryStatistics(Request $request)
    {
        $periodType = (string) $request->query('period_type', 'month');
        $year = $request->query('year');
        $month = $request->query('month');
        $quarter = $request->query('quarter');

        return response()->json(
            $this->statisticalService->getSalaryStatistics(
                $periodType,
                $year !== null ? (int) $year : null,
                $month !== null ? (int) $month : null,
                $quarter !== null ? (int) $quarter : null,
            )
        );
    }

    public function getProductExports(Request $request)
    {
        $periodType = (string) $request->query('period_type', 'month');
        $year = $request->query('year');
        $month = $request->query('month');
        $quarter = $request->query('quarter');

        return response()->json(
            $this->statisticalService->getProductExportStatistics(
                $periodType,
                $year !== null ? (int) $year : null,
                $month !== null ? (int) $month : null,
                $quarter !== null ? (int) $quarter : null,
            )
        );
    }

    public function exportReport(Request $request)
    {
        $validated = $request->validate([
            'section' => 'required|in:overview,workforce,salary,product-export',
            'type' => 'required|in:excel,pdf',
            'period_type' => 'required|in:month,quarter,year',
            'year' => 'nullable|integer|min:2020|max:2100',
            'month' => 'nullable|integer|between:1,12',
            'quarter' => 'nullable|integer|between:1,4',
        ]);

        $report = $this->statisticalService->buildReportForSection(
            (string) $validated['section'],
            (string) $validated['period_type'],
            isset($validated['year']) ? (int) $validated['year'] : null,
            isset($validated['month']) ? (int) $validated['month'] : null,
            isset($validated['quarter']) ? (int) $validated['quarter'] : null,
        );

        $baseFileName = ($report['file_name'] ?? 'bao-cao-thong-ke') . '-' . now()->format('Ymd-His');

        if ($validated['type'] === 'excel') {
            return Excel::download(
                new SimpleReportExport($report['headers'] ?? [], $report['rows'] ?? []),
                $baseFileName . '.xlsx'
            );
        }

        $pdf = Pdf::loadView('exports.statistical_report_pdf', [
            'title' => $report['title'] ?? 'Bao cao thong ke',
            'meta' => $report['meta'] ?? [],
            'headers' => $report['headers'] ?? [],
            'rows' => $report['rows'] ?? [],
        ])->setPaper('a4', 'landscape');

        return $pdf->download($baseFileName . '.pdf');
    }
}