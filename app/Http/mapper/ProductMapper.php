<?php

namespace App\Http\Mapper;

use App\Http\Responses\Product\ProductBaseResponse;
use App\Models\Product;

class ProductMapper {
    public static function toBaseResponse(Product $product): ProductBaseResponse {
        return new ProductBaseResponse(
            id: $product->id,
            name: $product->name, 
            listPrice: $product->list_price,    
            salePrice: $product->sale_price,    
            description: $product->description,
            urlVideo: $product->url_video,
            urlImageCover: $product->url_image_cover,
            soldQuantity: (int) $product->sold_quantity,
            avgRating: (float) $product->avg_rating,
            status: $product->status,
            createdAt: $product->created_at,
            updateAt: $product->updated_at
        );
    }
}