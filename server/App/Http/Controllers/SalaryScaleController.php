<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\SalaryScale\SalaryScaleRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Service\SalaryScaleService;
class SalaryScaleController extends Controller{
    use ApiResponse;

    protected SalaryScaleService $salaryScaleService;

    public function __construct(SalaryScaleService $salaryScaleService)
    {
        $this->salaryScaleService = $salaryScaleService;
    }
    public function index(Request $request)
    {
        $keyword = $request->query('keyword');
        $sort    = $request->query('sort');
        $page    = (int) $request->query('page', 1);
        $size    = (int) $request->query('size', 10);

        $result = $this->salaryScaleService->findAll($keyword, $sort, $page, $size);

        return $this->success($result, 'Tải danh sách thang lương thành công.');
    }

    public function store(SalaryScaleRequest $request)
    {
        $result = $this->salaryScaleService->create($request);
        return $this->success($result, 'Tạo thang lương thành công', 201);
    }

    public function update(SalaryScaleRequest $request, $id)
    {
        $this->salaryScaleService->update($request, $id);
        return $this->success(null, 'Cập nhật thang lương thành công');
    }

    public function destroy($id)
    {
        $this->salaryScaleService->delete($id);
        return $this->success(null, 'Xóa thang lương thành công');
    }
}