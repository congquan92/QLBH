<?php
namespace App\Http\Responses\Category;

use Carbon\Carbon;
class CategoryResponse {
    public function __construct(
        public int $id,
        public string $name,
        public array $childCategory, // De quy
        public string $status,
        public Carbon $createAt,
        public Carbon $updatedAt
    ) {}
}