<?php

namespace App\Http\Mapper;

use App\Http\Responses\Product\ProductBaseResponse;
use App\Http\Responses\product\ProductResponse;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class ProductMapper
{
    public static function toBaseResponse(Product $product): ProductBaseResponse
    {
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
    public static function toDetailResponse(Product $product): ProductResponse
    {
        Log::info("ac");
       Log::info('product->variant ', $product->productVariants ? $product->productVariants->toArray() : []);
        return new ProductResponse(
            id: $product->id,
            name: $product->name,
            description: $product->description,
            listPrice: $product->list_price,
            salePrice: $product->sale_price,
            status: $product->status,
            categoryId: $product->category_id,
            video: $product->video,
            coverImage: $product->url_image_cover,
            categoryParents: self::mapCategoryParents($product->category),
            imageProduct: $product->imageProducts->pluck('url')->toArray(),
            soldQuantity: (int) $product->sold_quantity,
            avgRating: (float) $product->avg_rating,
            attributes: $product->productAttributes->map(function ($pa) {
                return ProductAttributeMapper::toAttributeResponse($pa);
            })->toArray(),
            productVariant: $product->productVariants->map(function ($variant) {
                return ProductVariantMapper::toVariantResponse($variant);
            })->toArray(),
            createAt: $product->created_at,
            updateAt: $product->updated_at
        );

    }
    private static function mapCategoryParents(?Category $category): array
    {
        $parents = [];
        $current = $category;
        while ($current) {
            array_unshift($parents, [
                'id' => $current->id,
                'name' => $current->name
            ]);
            $current = $current->parent;
        }
        return $parents;
    }
}