<?php

namespace App\Http\Responses\Product;

use App\Enums\Status;
use Illuminate\Contracts\Support\Arrayable;
use Carbon\Carbon;

class ProductResponse implements Arrayable
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
        public string $listPrice,  
        public string $salePrice,
        public Status $status,
        public int $categoryId,
        public ?string $video,
        public ?string $coverImage,
        public array $categoryParents, 
        public array $imageProduct,    
        public int $soldQuantity,
        public float $avgRating,
        public array $attributes,     
        public array $productVariant, 
        public Carbon $createAt,
        public Carbon $updateAt
    ) {}

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'listPrice' => $this->listPrice,
            'salePrice' => $this->salePrice,
            'status' => $this->status,
            'categoryId' => $this->categoryId,
            'video' => $this->video,
            'coverImage' => $this->coverImage,
            'categoryParents' => $this->categoryParents,
            'imageProduct' => $this->imageProduct,
            'soldQuantity' => $this->soldQuantity,
            'avgRating' => $this->avgRating,
            'attributes' => $this->attributes,
            'productVariant' => $this->productVariant,
            'createAt' => $this->createAt->toDateTimeString(),
            'updateAt' => $this->updateAt->toDateTimeString(),
        ];
    }
}