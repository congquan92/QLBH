<?php
namespace App\Http\Service;

use App\Enums\DeliveryStatus;
use App\Http\Mapper\ReviewMapper;
use App\Http\Requests\ReviewProduct\ReviewCreationRequest;
use App\Http\Responses\PageResponse;
use App\Models\ImageReview;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use DB;
class ReviewSerivce
{
    protected CloudinaryService $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }
    public function findAll(?string $keyword, ?string $sort, int $page, int $size)
    {
        $query = Review::with(['user', 'image', 'product', 'orderItem']);

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
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            $user = auth()->user();

            $orderItem = OrderItem::where('id', $data['order_item_id'])
                ->whereHas('order', function ($query) use ($user) {
                    $query->where('user_id', $user->id)

                        ->where('order_status', DeliveryStatus::COMPLETED)
                        ->where('is_confirmed', true);
                })->firstOrFail();

            // 2. Chặn duplicate (Logic nghiệp vụ)
            if (Review::where('order_item_id', $orderItem->id)->exists()) {
                throw new \Exception("Bạn đã đánh giá sản phẩm này rồi.");
            }

            // 3. Thực thi lưu trữ
            $review = Review::create([
                'rating' => $data['rating'],
                'comment' => $data['comment'] ?? null,
                'user_id' => $user->id,
                'product_id' => $orderItem->product_id,
                'order_item_id' => $orderItem->id,
                'status' => 'ACTIVE',
            ]);

            // 4. Lưu ảnh (Dùng createMany để tối ưu query)
            if (!empty($data['image_url'])) {
                $images = collect($data['image_url'])->map(fn($url) => [
                    'url_image' => $url,
                ])->toArray();

                $review->image()->createMany($images);
            }

            $orderItem->update(['is_reviewed' => true]);
            $this->updateProductAvgRating($orderItem->product_id);

            return $review;
        });
    }

    /**
     * Cập nhật điểm đánh giá trung bình của sản phẩm
     */
    private function updateProductAvgRating($productId)
    {
        $avgRating = Review::where('product_id', $productId)
            ->avg('rating');

        Product::where('id', $productId)->update([
            'avg_rating' => round($avgRating ?? 0, 1)
        ]);
    }
    public function addImage(array $imageUrls, int $reviewId): void
    {
        // 1. Lấy user đang đăng nhập
        $user = auth()->user();

        // 2. Tìm Review và kiểm tra quyền sở hữu (Security check)
        $review = Review::where('id', $reviewId)
            ->where('status', 'ACTIVE')
            ->where('user_id', $user->id)
            ->firstOrFail();

        // 3. Chuẩn bị dữ liệu để insert hàng loạt (Bulk insert)
        $imageData = array_map(function ($url) {
            return [
                'url_image' => $url,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }, $imageUrls);

        // 4. Sử dụng quan hệ (Relationship) để lưu
        // Giả định trong Model Review bạn có: public function image() { return $this->hasMany(ImageReview::class); }
        $review->image()->createMany($imageData);
    }
    public function deleteImage(array $imageIds, int $reviewId): void
    {
        DB::transaction(function () use ($imageIds, $reviewId) {
            $user = auth()->user();

            $images = ImageReview::whereIn('id', $imageIds)
                ->where('review_id', $reviewId)
                ->whereHas('review', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->get();

            if ($images->isEmpty())
                return;

            $urls = $images->pluck('url_image')->toArray();

            // Xóa DB
            ImageReview::whereIn('id', $images->pluck('id'))->delete();

            // Xóa Cloudinary
            $this->cloudinaryService->deleteByUrls($urls);
        });
    }
    public function update($id, array $data)
    {
        return DB::transaction(function () use ($id, $data): void {
            $review = Review::where('id', $id)->firstOrFail();
            $review->update($data);
        });
    }


    public function getReviewById(int $reviewId)
    {
        $review = Review::with(['user', 'image', 'product', 'orderItem'])
            ->where('id', $reviewId)
            ->where('status', 'ACTIVE')
            ->firstOrFail();

        return ReviewMapper::toReviewResponse($review);
    }
    public function getReviewMeByProduct(int $productId): array
    {
        $user = auth()->user();

        // Kiểm tra sản phẩm tồn tại và đang ACTIVE
        Product::where('id', $productId)
            ->where('status', 'ACTIVE')
            ->firstOrFail();

        $reviews = Review::with(['user', 'image', 'product', 'OrderItem'])
            ->where('product_id', $productId)
            ->where('user_id', $user->id)
            ->get();

        return $reviews->map(function ($review) {
            return ReviewMapper::toReviewResponse($review);
        })->toArray();
    }

    public function delete($id)
    {
        return DB::transaction(function () use ($id): void {
            $review = Review::where('id', $id)->firstOrFail();
            $productId = $review->orderItem->product_id;
            if ($review->image->isNotEmpty()) {
                $urls = $review->image->pluck('url_image')->toArray();
                $this->cloudinaryService->deleteByUrls($urls);
            }
            $review->delete();
            $this->updateProductAvgRating($productId);
        });
    }
}