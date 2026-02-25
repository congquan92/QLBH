<?php

namespace App\Http\Service;

use App\Http\Mapper\PositionMapper;
use App\Http\Responses\PageResponse;
use App\Models\Position;
use App\Models\User;
use Exception;

class PositionService
{
    /**
     * Tìm kiếm và phân trang Position (Dùng chung cho Client/Admin)
     */
    public function findAll(?string $keyword, ?string $sort, int $page, int $size): PageResponse
    {
        $query = Position::query();

        $column = 'id';
        $direction = 'desc';
        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
        }
        $query->orderBy($column, $direction);

        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('salary_type', 'like', "%{$keyword}%");
            });
        }
        $paginator = $query->paginate($size, ['*'], 'page', $page);

        $dtoItems = $paginator->getCollection()->map(function ($position) {
            return PositionMapper::toBaseResponse($position);
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }
    /**
     * Cập nhật chức vụ mới cho một nhân viên
     */
    public function updateEmployeePosition(int $userId, int $newPositionId)
    {
        $user = User::findOrFail($userId);

        // Kiểm tra xem position mới có tồn tại không
        Position::findOrFail($newPositionId);

        return $user->update([
            'position_id' => $newPositionId
        ]);
    }

    /**
     * Xem danh sách nhân viên của một Position cụ thể
     */
    public function getEmployeesByPosition(int $positionId, int $page, int $size): array
    {
        $position = Position::findOrFail($positionId);
        $positionData = PositionMapper::toBaseResponse($position);
        $paginator = User::where('position_id', $positionId)
            ->orderBy('full_name', 'asc')
            ->paginate($size, ['*'], 'page', $page);

        $dtoItems = $paginator->getCollection()->map(function ($user) {
            return [
                'id' => $user->id,
                'user_name' => $user->username,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status
            ];
        });

        $paginator->setCollection($dtoItems);
        $pageResponse = PageResponse::fromLaravelPaginator($paginator);
        return [
            'position' => $positionData,
            'employees' => $pageResponse
        ];
    }

    public function store(array $data)
    {
        return Position::create($data);
    }

    public function update(int $id, array $data)
    {
        $position = Position::findOrFail($id);
        $position->update($data);
        return $position;
    }

    public function delete(int $id)
    {
        $position = Position::findOrFail($id);

        if ($position->users()->exists()) {
            throw new Exception("Không thể xóa chức vụ này vì vẫn còn nhân viên đang đảm nhiệm.");
        }

        return $position->delete();
    }
}