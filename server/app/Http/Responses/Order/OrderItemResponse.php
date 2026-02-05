<?php

namespace App\Http\Responses\Order;

use App\Http\Responses\Product\ProductBaseResponse;

use App\Http\Responses\ProductVariant\ProductVariantResponse;
use App\Models\OrderItem;


class OrderItemResponse {
    public function __construct(
        public int $orderItemId,
        public bool $isReviewed,
        public int $quantity,
        public float $listPriceSnapShot,
        public float $finalPrice,
        public ?string $urlImageSnapShot,
        public string $nameProductSnapShot,
        public ?string $variantSnapShot,
    ) {}
}