<?php

namespace App\Http\Mapper;

use App\Enums\Status;
use App\Models\Cart;

class CartMapper
{
    public static function toResponse(Cart $cart): array
    {
        $variant = $cart->productVariant;
        $product = $variant?->product;

        $availableStock = $variant ? max(0, (int) $variant->quantity) : 0;
        $variantStatus = $variant ? ($variant->status?->value ?? (string) $variant->status) : null;
        $productStatus = $product ? ($product->status?->value ?? (string) $product->status) : null;

        $isAvailable = true;
        $unavailableReason = null;

        if (!$variant) {
            $isAvailable = false;
            $unavailableReason = 'Biến thể sản phẩm không còn tồn tại.';
        } elseif (!$product) {
            $isAvailable = false;
            $unavailableReason = 'Sản phẩm không còn tồn tại.';
        } elseif ($variantStatus !== Status::ACTIVE->value) {
            $isAvailable = false;
            $unavailableReason = 'Biến thể sản phẩm đã ngừng kinh doanh.';
        } elseif ($productStatus !== Status::ACTIVE->value) {
            $isAvailable = false;
            $unavailableReason = 'Sản phẩm đã ngừng kinh doanh.';
        } elseif ($availableStock <= 0) {
            $isAvailable = false;
            $unavailableReason = 'Sản phẩm đã hết hàng.';
        }

        return [
            'id' => $cart->id,
            'product_variant_id' => $cart->product_variant_id,
            'product_variant' => $variant ? ProductVariantMapper::toVariantResponse($variant) : null,
            'quantity' => $cart->quantity,
            'name' => $product?->name ?? $cart->name_product_snapshot,
            'price' => $variant?->price ?? $cart->list_price_snapshot,
            'image' => $product?->url_image_cover ?? $cart->url_image_snapshot,
            'attributes' => $variant ? ProductVariantMapper::toVariantResponse($variant) : $cart->variant_attributes_snapshot,
            'status' => $cart->status,
            'is_available' => $isAvailable,
            'available_stock' => $availableStock,
            'unavailable_reason' => $unavailableReason,
        ];
    }
}