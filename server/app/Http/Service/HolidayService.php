<?php
namespace App\Http\Service;

use App\Http\Responses\PageResponse;
use App\Models\Holiday;
use Exception;

class HolidayService
{
    public function findAll(?string $keyword, ?string $sort, int $page, int $size): PageResponse
    {
        $query = Holiday::query();
        $column = 'holiday_date'; 
        $direction = 'asc';

        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
        }

        $query->orderBy($column, $direction);

        if (!empty($keyword)) {
            $query->where('name', 'like', "%{$keyword}%");
        }

        $paginator = $query->paginate($size, ['*'], 'page', $page);
        $dtoItems = $paginator->getCollection()->map(function ($holiday) {
            return [
                'id' => $holiday->id,
                'name' => $holiday->name,
                'holiday_date' => $holiday->holiday_date->format('Y-m-d'),
                'created_at' => $holiday->created_at->format('Y-m-d H:i:s'),
            ];
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }

    public function create(array $data)
    {

        $exists = Holiday::where('holiday_date', $data['holiday_date'])->exists();
        if ($exists) {
            throw new Exception("Ngày lễ này đã tồn tại trong hệ thống.");
        }

        return Holiday::create($data);
    }

    public function update($id, array $data)
    {
        $holiday = Holiday::findOrFail($id);

        if (isset($data['holiday_date']) && $data['holiday_date'] != $holiday->holiday_date) {
            $exists = Holiday::where('holiday_date', $data['holiday_date'])
                ->where('id', '!=', $id)
                ->exists();
            if ($exists) {
                throw new Exception("Ngày lễ mới bị trùng với một ngày khác đã có sẵn.");
            }
        }

        $holiday->update($data);
        return $holiday;
    }

    public function delete($id)
    {
        $holiday = Holiday::findOrFail($id);
        return $holiday->delete();
    }
}

