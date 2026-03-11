<?php
namespace App\Http\Mapper;

use App\Http\Responses\ReviewProduct\ReviewResponse;
use App\Models\Review;

class ReviewMapper
{
    public static function toReviewResponse(Review $review): ReviewResponse
    {
        $imageResponse = $review->image->map(function ($img) {
            return [
                'id' => $img->id,
                'url' => $img->url_image 
            ];
        })->toArray();

        // 2. Map User DTO
        $userResponse = UserMapper::toUserResponse($review->user);

        return new ReviewResponse(
            $review->id,
            $review->product->id,
            $review->orderItem->name_product_snapshot,
            $review->orderItem->variant_attributes_snapshot,
            $review->rating,
            $review->comment ?? '',
            $imageResponse,
            $userResponse,
            $review->created_at,
            $review->updated_at
        );
    }
}