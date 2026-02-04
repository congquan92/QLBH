<?php
namespace App\Http\Responses\ProductVariant;
class ProductVariantResponse {
    public function __construct(
        public int $id,
        public int $weight,
        public int $length,
        public int $width,
        public int $height,
        public string $price,
        public int $quantity,
        public string $sku,
        public array $variantAttributes 
    ) {}
}