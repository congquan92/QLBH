<?php
namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Http\Service\SalaryService;
use Illuminate\Http\Request;

class SalaryController extends Controller
{
    use ApiResponse;
    protected $salaryService;

    public function __construct(SalaryService $service)
    {
        $this->salaryService = $service;
    }

    public function calculateMonthlySalary(Request $request, $userId)
    {
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year'  => 'required|integer|min:2020',
        ]);

        $result = $this->salaryService->calculateMonthlySalary(
            $userId,
            $request->month,
            $request->year
        );
        return $this->success($result, "Tinh luong thanh cong.");
    }

    public function calculateMonthlySalaryMe(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year'  => 'required|integer|min:2020',
        ]);
        $user = auth()->user();
        $result = $this->salaryService->calculateMonthlySalary(
            $user->id,
            $request->month,
            $request->year
        );
        return $this->success($result, "Tinh luong thanh cong.");
    }

    /**
     * Tinh luong cho tat ca nhan vien trong 1 thang.
     * GET /salaries/all?month=3&year=2026
     */
    public function calculateAllSalaries(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year'  => 'required|integer|min:2020',
        ]);

        $results = $this->salaryService->calculateAllMonthlySalaries(
            $request->month,
            $request->year
        );

        return $this->success($results, "Tinh luong tat ca nhan vien thanh cong.");
    }
}