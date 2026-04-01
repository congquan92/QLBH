<?php
namespace App\Http\Service;

use App\Enums\Status;
use App\Models\Shift;
use App\Http\Responses\PageResponse;
use Exception;

class ShiftService
{
    public function findAll(?string $keyword, ?string $status, ?string $sort, int $page, int $size): PageResponse
    {
        $query = Shift::query();

        if (!empty($status) && strtoupper($status) !== 'ALL') {
            $query->where('status', strtoupper($status));
        } elseif (empty($status)) {
            $query->where('status', Status::ACTIVE->value);
        }

        // 1. Sắp xếp dynamic
        $column = 'start_time';
        $direction = 'asc';
        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
        }
        $query->orderBy($column, $direction);

        // 2. Tìm kiếm theo từ khóa (tên ca)
        if (!empty($keyword)) {
            $query->where('name', 'like', "%{$keyword}%");
        }

        // 3. Phân trang
        $paginator = $query->paginate($size, ['*'], 'page', $page);

        return PageResponse::fromLaravelPaginator($paginator);
    }

    public function create(array $data)
    {
        if (!array_key_exists('status', $data)) {
            $data['status'] = Status::ACTIVE->value;
        }
        return Shift::create($data);
    }

    public function update($id, array $data)
    {
        $shift = Shift::findOrFail($id);
        $shift->update($data);
        return $shift;
    }

    public function delete($id)
    {
        $shift = Shift::findOrFail($id);

        if ($shift->assignments()->exists()) {
            throw new Exception("Không thể xóa ca '{$shift->name}' vì đang có nhân viên được phân công làm ca này.");
        }

        $shift->update(['status' => Status::INACTIVE->value]);
        return $shift;
    }

    public function restore($id)
    {
        $shift = Shift::findOrFail($id);
        $shift->update(['status' => Status::ACTIVE->value]);
        return $shift;
    }
}