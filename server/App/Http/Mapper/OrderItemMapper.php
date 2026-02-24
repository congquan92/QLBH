<?php

namespace App\Http\Mapper;

use App\Http\Responses\Order\OrderItemResponse;
use App\Models\OrderItem;
use App\Http\Mapper\ProductMapper; 
use App\Http\Mapper\ProductVariantMapper;

class OrderItemMapper
{
    public static function toOrderItemResponse(OrderItem $orderItem): OrderItemResponse
    {
        return new OrderItemResponse(
            orderItemId: $orderItem->id,
            isReviewed: (bool) $orderItem->is_reviewed,
            quantity: $orderItem->quantity,
            listPriceSnapShot: (float) $orderItem->list_price_snapShot,
            finalPrice: (float) $orderItem->final_price,
            urlImageSnapShot: $orderItem->url_image_snapShot,
            nameProductSnapShot: $orderItem->name_product_snapshot,
            variantSnapShot: $orderItem->variant_attributes_snapshot 
                ? json_encode($orderItem->variant_attributes_snapshot) 
                : null
        );
    }
}