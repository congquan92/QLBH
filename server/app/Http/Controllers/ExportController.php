<?php
namespace App\Http\Controllers;

use App\Exports\LateArrivalsExport;
use App\Http\Service\ExportService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    protected $exportService;

    public function __construct(ExportService $exportService)
    {
        $this->exportService = $exportService;
    }

    /**
     * Endpoint Xuất Excel: GET /api/export/schedule?start_date=2026-02-15&type=excel
     * Endpoint Xuất PDF:   GET /api/export/schedule?start_date=2026-02-15&type=pdf
     */
    public function exportSchedule(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'type' => 'required|in:excel,pdf'
        ]);

        $data = $this->exportService->getExportData($request->start_date);

        if ($request->type === 'excel') {
            return Excel::download(new \App\Exports\ScheduleExport($data), 'lich-lam-viec.xlsx');
        }

        if ($request->type === 'pdf') {
            $pdf = Pdf::loadView('exports.schedule_pdf', $data)->setPaper('a4', 'landscape');
            return $pdf->download('lich-lam-viec.pdf');
        }
    }
    // Trong App\Http\Controllers\ExportController.php

    /**
     * Endpoint: GET /api/export/my-schedule?type=pdf
     * (Mặc định lấy tuần hiện tại)
     */
    public function exportMySchedule(Request $request)
    {
        $request->validate(['type' => 'required|in:excel,pdf']);

        $user = auth()->user(); // Lấy nhân viên đang đăng nhập
        $today = now();

        $data = $this->exportService->getPersonalExportData($user, $today);

        if ($request->type === 'pdf') {
            // Xuất PDF theo dạng danh sách dọc cho dễ đọc trên điện thoại
            $pdf = Pdf::loadView('exports.personal_schedule_pdf', $data)
                ->setPaper('a4', 'landscape');
            return $pdf->download("Lich-ca-nhan-tuan-" . now()->weekOfYear . ".pdf");
        }

        if ($request->type === 'excel') {
            return Excel::download(new \App\Exports\PersonalScheduleExport($data), 'lich-ca-nhan.xlsx');
        }
    }
    public function exportLateArrivals(Request $request)
    {
        $request->validate([
            'time_range' => 'required|in:THIS_WEEK,LAST_WEEK,THIS_MONTH,LAST_MONTH',
        ]);

        $result = $this->exportService->getLateArrivalsData($request->time_range);

        $fileName = 'danh-sach-di-tre-' . strtolower($request->time_range) . '.xlsx';

        return Excel::download(
            new LateArrivalsExport($result['data']),
            $fileName
        );
    }
}