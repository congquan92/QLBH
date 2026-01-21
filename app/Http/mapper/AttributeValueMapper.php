<?php
namespace App\Http\Mapper;

use App\Http\Responses\attributeValue\AttributeValueResponse;
use App\Models\ProductAttributeValue;

class AttributeValueMapper{
    public static function toAttributeValueResponse(ProductAttributeValue $productAttributeValue):AttributeValueResponse{
        return new AttributeValueResponse(
            id: $productAttributeValue->id,
            value: $productAttributeValue->value
        );
    }
}