<?php
namespace App\Http\Mapper;

use App\Http\Responses\Attribute\AttributeResponse;
use App\Models\Attribute;
use App\Models\ProductAttribute;
use Illuminate\Support\Facades\Log;

class ProductAttributeMapper {
    public static function toAttributeResponse(ProductAttribute $pa):AttributeResponse{
        Log::info("HUYYYY");
        return new AttributeResponse(
            id: $pa->attribute->id,
            name: $pa->attribute->name, 
            attributeValue: $pa->values->map(function($val) {
                return AttributeValueMapper::toAttributeValueResponse($val);
            })->toArray()
        );
    }
}