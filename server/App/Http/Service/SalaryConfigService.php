<?php
namespace App\Http\Service;

use App\Http\Mapper\SalaryConfigMapper;
use App\Http\Requests\Salary\SalaryConfigCreationRequest;
use App\Http\Requests\Salary\SalaryConfigUpdateRequest;
use App\Http\Responses\PageResponse;
use App\Models\SalaryConfig;
use Illuminate\Support\Facades\DB;
class SalaryConfigService
{

    public function findAll(?string $keyword, ?string $sort, int $page, int $size): PageResponse
    {
        $query = SalaryConfig::query();

        $column = 'id';
        $direction = 'asc';

        if ($sort && str_contains($sort, ':')) {
            [$partsColumn, $partsDirection] = explode(':', $sort);
            $allowedColumns = ['id', 'rule_name', 'multiplier', 'created_at'];
            if (in_array($partsColumn, $allowedColumns)) {
                $column = $partsColumn;
                $direction = strtolower($partsDirection) === 'desc' ? 'desc' : 'asc';
            }
        }
        $query->orderBy($column, $direction);
        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('rule_name', 'like', "%{$keyword}%")
                    ->orWhere('employee_type', 'like', "%{$keyword}%");
            });
        }

        $paginator = $query->paginate($size, ['*'], 'page', $page);

        $dtoItems = $paginator->getCollection()->map(function ($config) {
            return SalaryConfigMapper::toSalaryConfigMapper($config);
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }

    public function create(SalaryConfigCreationRequest $req)
    {
        return DB::transaction(function () use ($req) {
            $configsData = $req->validated()['configs'];

            foreach ($configsData as $data) {
                SalaryConfig::create([
                    'rule_name' => $data['rule_name'],
                    'employee_type' => $data['employee_type'],
                    'multiplier' => $data['multiplier'],
                    'is_holiday' => $data['is_holiday'],
                ]);
            }
        });
    }

    public function update(SalaryConfigUpdateRequest $req, $id)
    {
        $salaryConfig = SalaryConfig::findOrFail($id);
        $data = array_filter($req->validated(), function ($value) {
            return !is_null($value);
        });
        $salaryConfig->update($data);
    }

    public function delete($id)
    {
        $salaryConfig = SalaryConfig::findOrFail($id);
        $salaryConfig->delete();
    }
}