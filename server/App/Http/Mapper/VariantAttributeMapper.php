<?php
namespace App\Http\Mapper;

use App\Http\Responses\VariantAttribute\VariantAttributeResponse;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Log;

class VariantAttributeMapper
{
    public static function toVariantResponse(ProductAttributeValue $productAttributeValue): VariantAttributeResponse
    {

        return new VariantAttributeResponse(
            id: $productAttributeValue->id,
            attribute: $productAttributeValue->productAttribute->attribute->name,
            value: $productAttributeValue->value
        );
    }
}