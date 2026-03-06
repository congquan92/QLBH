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
}    