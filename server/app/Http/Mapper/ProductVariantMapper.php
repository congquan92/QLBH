<?php
namespace App\Http\Mapper;

use App\Http\Responses\ProductVariant\ProductVariantResponse;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Log;


class ProductVariantMapper
{
    public static function toVariantResponse(ProductVariant $variant): ProductVariantResponse
    {
        return new ProductVariantResponse(
            id: $variant->id,
            weight: $variant->weight,
            length: $variant->length,
            width: $variant->width,
            height: $variant->height,
            price: $variant->price,
            quantity: $variant->quantity,
            sku: $variant->sku,
            variantAttributes: $variant->attributeValues->map(function ($val) {
                return variantAttributeMapper::toVariantResponse($val);
            })->toArray()
        );
    }
    public function jsonSerialize(): mixed
    {
        return get_object_vars($this);
    }
}