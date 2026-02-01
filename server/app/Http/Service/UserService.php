<?php
namespace App\Http\Service;

use App\Http\Mapper\UserMapper;
use App\Http\Responses\PageResponse;
use App\Models\User;
class UserService
{
    public function findAll(?string $keyword, ?string $sort, int $page, int $size, ?bool $hasUserRole): PageResponse
    {
        $currentUser = auth()->user();

        $query = User::query()->where('id', '!=', $currentUser->id);

        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $loweredKeyword = "%" . strtolower($keyword) . "%";
                $q->where('full_name', 'like', $loweredKeyword)
                    ->orWhere('email', 'like', $loweredKeyword)
                    ->orWhere('phone', 'like', $loweredKeyword)
                    ->orWhere('username', 'like', $loweredKeyword);
            });
        }
        if ($hasUserRole === true) {
          $query->whereRelation('role', 'name', 'USER');
        } elseif ($hasUserRole === false) {
            $query->whereRelation('role', 'name', '!=', 'USER');
        }

        $column = 'id';
        $direction = 'asc';
        if ($sort && str_contains($sort, ':')) {
            [$partsColumn, $partsDirection] = explode(':', $sort);
            $column = $partsColumn;
            $direction = strtolower($partsDirection) === 'asc' ? 'asc' : 'desc';
        }
        $query->orderBy($column, $direction);

        $paginator = $query->paginate($size, ['*'], 'page', $page);

        $dtoItems = $paginator->getCollection()->map(function ($user) {
            return UserMapper::toUserResponse($user);
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }
}