<?php
namespace App\Http\Mapper;


use App\Http\Responses\AttributeValue\AttributeValueResponse;
use App\Models\ProductAttributeValue;

class AttributeValueMapper{
    public static function toAttributeValueResponse(ProductAttributeValue $productAttributeValue):AttributeValueResponse{
        return new AttributeValueResponse(
            id: $productAttributeValue->id,
            value: $productAttributeValue->value,
            image: $productAttributeValue->url_image
        );
    }
}