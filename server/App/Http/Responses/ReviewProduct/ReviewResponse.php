<?php
namespace App\Http\Responses\ReviewProduct;

use App\Http\Responses\User\UserResponse;
use Carbon\Carbon;
class ReviewResponse
{
    public function __construct(
        public int $id,
        public int $productId,
        public string $avatarUser,
        public string $fullName,
        public int $rating,
        public string $comment,
        public array $imageResponse,
        public UserResponse $userResponse,
        public Carbon $createdAt,
        public Carbon $updateAt,
    ) {
    }
}