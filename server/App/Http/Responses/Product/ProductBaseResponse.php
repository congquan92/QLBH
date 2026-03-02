<?php

namespace App\Http\Responses\Product;

use App\Enums\Status;
use Carbon\Carbon;


class ProductBaseResponse 
{
    public function __construct(
        public int $id,
        public string $name,
        public string $listPrice,  
        public string $salePrice,   
        public ?string $description,
        public ?string $urlVideo,
        public ?string $urlImageCover,
        public int $soldQuantity,
        public float $avgRating,    
        public Status $status,
        public Carbon $createdAt,
        public Carbon $updateAt
    ) {}

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'listPrice' => $this->listPrice,
            'salePrice' => $this->salePrice,
            'description' => $this->description,
            'urlVideo' => $this->urlVideo,
            'urlImageCover' => $this->urlImageCover,
            'soldQuantity' => $this->soldQuantity,
            'avgRating' => (float) $this->avgRating,
            'status' => $this->status,
            'createdAt' => $this->createdAt->toISOString(),
            'updateAt' => $this->updateAt->toISOString(),
        ];
    }
}