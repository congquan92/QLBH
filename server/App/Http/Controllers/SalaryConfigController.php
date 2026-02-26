<?php

namespace App\Http\Controllers;


use App\Http\Requests\Salary\SalaryConfigCreationRequest;
use App\Http\Requests\Salary\SalaryConfigUpdateRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Service\SalaryConfigService;
use Illuminate\Http\Request;


class SalaryConfigController extends Controller
{
    use ApiResponse;
    protected SalaryConfigService $salaryConfigService;

    public function __construct(SalaryConfigService $salaryConfigService)
    {
        $this->salaryConfigService = $salaryConfigService;
    }
    public function findAll(Request $request)
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $result = $this->salaryConfigService->findAll($keyword, $sort, $page, $size);
        return $this->success($result, 'Salary config list fetched successfully');
    }
    public function add(SalaryConfigCreationRequest $request)
    {
        $this->salaryConfigService->create($request);
    }

    public function update(SalaryConfigUpdateRequest $request , $id)
    {
        $this->salaryConfigService->update($request,$id);
    }

    public function delete($id){
        $this->salaryConfigService->delete($id);
    }
}
