<?php
namespace App\Http\Responses\UserRank;
class UserRankResponse {
    public function __construct(
        public int $id,
        public string $name,
        public string $minSpent,
        public string $status,
    ) {}
}