<?php
namespace App\Http\Service;

use App\Enums\Status;
use App\Http\Mapper\UserRankMapper;
use App\Http\Requests\UserRank\UserRankCreationRequest;
use App\Http\Responses\PageResponse;
use App\Models\UserRank;
use DB;
class UserRankService{
   public function findAll(?string $keyword, ?string $sort, int $page, int $size)
    {
        $query = UserRank::query();
        $query->where('status', '!=', Status::DISABLED->value);

        if (!empty($keyword)) {
            $query->where('name', 'like', "%{$keyword}%");
        }

        $column = 'id';
        $direction = 'desc';
        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1] ?? 'asc') === 'asc' ? 'asc' : 'desc';
        }

        $paginator = $query->orderBy($column, $direction)
                           ->paginate($size, ['*'], 'page', $page);

        // 4. Mapping sang Response DTO
        $dtoItems = $paginator->getCollection()->map(function ($rank) {
            return UserRankMapper::toUserRankResponse($rank);
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }
    public function create(UserRankCreationRequest $request){
    $data = $request->validated();
        return UserRank::create($data);
    }
    public function update ($id, array $data){
        return DB::transaction(function () use ($id, $data): void {
             $userRank = UserRank::where('id',$id)->firstOrFail();
            $userRank->update($data);
        });
    }

    public function getUsersByRank(?string $rankId, ?string $keyword, int $page, int $size): PageResponse
    {
        $query = \App\Models\User::query()
            ->where('user_rank_id', $rankId)
            ->whereHas('role', fn($q) => $q->where('name', 'USER'))
            ->with(['userRank', 'role']);

        if (!empty($keyword)) {
            $lower = '%' . strtolower($keyword) . '%';
            $query->where(function ($q) use ($lower) {
                $q->where('full_name', 'like', $lower)
                  ->orWhere('email', 'like', $lower)
                  ->orWhere('phone', 'like', $lower);
            });
        }

        $paginator = $query->orderBy('total_spent', 'desc')->paginate($size, ['*'], 'page', $page);

        $dtoItems = $paginator->getCollection()->map(function ($user) {
            return \App\Http\Mapper\UserMapper::toUserResponse($user);
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }
}    