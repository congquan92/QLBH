<?php
namespace App\Http\Service;

use App\Http\Requests\SalaryScale\SalaryScaleRequest;
use App\Http\Responses\PageResponse;
use App\Models\SalaryScale;
use Illuminate\Support\Facades\DB;
class SalaryScaleService
{

public function findAll(?string $keyword, ?string $sort, int $page, int $size)
{
    $query = SalaryScale::query();

    if (!empty($keyword)) {
        $query->where('name', 'like', "%{$keyword}%");
    }

    $column = 'years_of_experience';
    $direction = 'asc';
    if ($sort && str_contains($sort, ':')) {
        $parts = explode(':', $sort);
        $column = $parts[0];
        $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
    }
    $query->orderBy($column, $direction);

    $paginator = $query->paginate($size, ['*'], 'page', $page);
    $dtoItems = $paginator->getCollection()->map(function ($scale) {
        return [
            'id'                  => $scale->id,
            'name'                => $scale->name,
            'years_of_experience' => $scale->years_of_experience,
            'coefficient'         => (float) $scale->coefficient,
            'created_at'          => $scale->created_at->format('Y-m-d H:i:s'),
        ];
    });
    $paginator->setCollection($dtoItems);
    return PageResponse::fromLaravelPaginator($paginator);
}

    public function create(SalaryScaleRequest $req)
    {
        return DB::transaction(function () use ($req) {
            SalaryScale::create($req->validated());
        });
    }
    public function update(SalaryScaleRequest $request, $id)
    {
        $scale = SalaryScale::findOrFail($id);
        $scale->update($request->validated());
    }
    public function delete($id)
    {
        $scale = SalaryScale::findOrFail($id);
        $scale->delete();
    }
}