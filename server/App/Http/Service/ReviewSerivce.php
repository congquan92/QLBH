<?php
namespace App\Http\Service;

use App\Http\Mapper\ReviewMapper;
use App\Http\Responses\PageResponse;
use App\Models\Review;
use DB;
class ReviewSerivce
{
    public function findAll(?string $keyword, ?string $sort, int $page, int $size)
    {
        $query = Review::with(['user', 'image', 'product']);

        if (!empty($keyword)) {
            $query->where('comment', 'like', "%{$keyword}%");
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
        $dtoItems = $paginator->getCollection()->map(function ($review) {
            return ReviewMapper::toReviewResponse($review);
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }
    public function create( $request)
    {
        $data = $request->validated();
        return Review::create($data);
    }
    public function update($id, array $data)
    {
        return DB::transaction(function () use ($id, $data): void {
            $review = Review::where('id', $id)->firstOrFail();
            $review->update($data);
        });
    }

    public function delete($id){
         return DB::transaction(function () use ($id): void {
            $review = Review::where('id', $id)->firstOrFail();
            $review->delete($id);
        });
    }
}