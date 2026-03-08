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
            'year' => 'required|integer|min:2020',
        ]);

        $result = $this->salaryService->calculateMonthlySalary(
            $userId,
            $request->month,
            $request->year
        );
        return $this->success($result, "Tính lương thành công.");

    }
     public function calculateMonthlySalaryMe(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020',
        ]);
        $user = auth()->user();
        $result = $this->salaryService->calculateMonthlySalary(
            $user->id,
            $request->month,
            $request->year
        );
        return $this->success($result, "Tính lương thành công.");

    }
}