<?php

namespace App\Http\Mapper;

use App\Models\Cart;
use App\Models\ProductVariant;

class CartMapper
{
    public static function toResponse(Cart $cart): array
    {
        $variant = $cart->productVariant;
        return [
            'id' => $cart->id,
            'product_variant_id' => $cart->product_variant_id,
            'product_variant' => $variant ? ProductVariantMapper::toVariantResponse($variant) : null,
            'quantity' => $cart->quantity,
            'name' => $cart->name_product_snapshot,
            'price' => $cart->list_price_snapshot,
            'image' => $cart->url_image_snapshot,
            'attributes' => $cart->variant_attributes_snapshot,
            'status' => $cart->status,
            'is_available' => (bool)$cart->productVariant,
        ];
    }
}