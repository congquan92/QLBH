<?php
namespace App\Http\Service;
use App\Enums\Status;
use App\Http\Requests\Product\ProductCreationRequest;
use App\Models\Attribute;
use App\Models\Category;
use App\Models\ImageProduct;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;
class ProductService
{
    public function create(ProductCreationRequest $req)
    {
        return DB::transaction(function () use ($req) {

            $product = $this->createBaseProduct($req);


            $productAttributeValues = [];
            if ($req->has('attributes') && !empty($req->attributes)) {
                $productAttributeValues = $this->processAttributes($product, $req->input('attributes', []));
            }


            if ($req->has('productVariant') && !empty($req->productVariant)) {
                $this->processVariants($product, $productAttributeValues, $req->productVariant);
            } else {
                // $this->createDefaultVariantForProduct($product, $req);
            }

            return $product;
        });
    }

    private function createBaseProduct($req): Product
    {
        $category = Category::where('id', $req->categoryId)
            ->where('status', Status::ACTIVE)
            ->firstOrFail();

        $supplier = Supplier::where('id', $req->supplierId)
            ->where('status', Status::ACTIVE)
            ->firstOrFail();

        $product = Product::create([
            'category_id' => $category->id,
            'supplier_id' => $supplier->id,
            'name' => $req->name,
            'description' => $req->description,
            'list_price' => $req->listPrice,
            'sale_price' => $req->salePrice,
            'url_video' => $req->video,
            'url_image_cover' => $req->coverImage,
            'sold_quantity' => 0,
            'avg_rating' => 0.0
        ]);
        if ($req->has('imageProduct')) {
            foreach ($req->imageProduct as $url) {
                ImageProduct::create([
                    'product_id' => $product->id,
                    'url' => $url,
                    'status' => 'ACTIVE'
                ]);
            }
        }
        return $product;
    }

    private function processAttributes(Product $product, array $attributesData)
    {
        $allCreatedValues = collect();

        foreach ($attributesData as $attrReq) {
            // Bước A: Tìm hoặc tạo Attribute gốc (VD: "Màu sắc")
            $attribute = Attribute::firstOrCreate(['name' => $attrReq['name']]);

            // Bước B: Tạo liên kết Nhiều-Nhiều trong bảng product_attribute
            // Chúng ta dùng Model ProductAttribute để lấy ID của dòng trung gian
            $productAttribute = ProductAttribute::firstOrCreate([
                'product_id' => $product->id,
                'attribute_id' => $attribute->id
            ]);

            // Bước C: Lưu các giá trị cụ thể (VD: "Đỏ", "Xanh") cho sản phẩm này
            foreach ($attrReq['attributeValue'] as $valReq) {
                $value = ProductAttributeValue::create([
                    'product_attribute_id' => $productAttribute->id,
                    'value' => $valReq['value']
                ]);

    
                $allCreatedValues->push([
                    'attribute' => $attrReq['name'], 
                    'value' => $valReq['value'], 
                    'object' => $value
                ]);
            }
        }

        return $allCreatedValues;
    }

    private function processVariants(Product $product, $availableValues, array $variantsData)
    {
        foreach ($variantsData as $variantReq) {
            // 1. Tạo Variant
            $variant = ProductVariant::create([
                'product_id' => $product->id,
                'sku' => $variantReq['sku'] ?? uniqid('SKU_'),
                'price' => $variantReq['price'],
                'height' => $variantReq['height'],
                'width' => $variantReq['width'],
                'length' => $variantReq['length'],
                'weight' => $variantReq['weight'],
            ]);

            // 2. Gắn các giá trị thuộc tính vào Variant (Many-to-Many giữa Variant và ProductAttributeValue)
            foreach ($variantReq['variantAttributes'] as $vAttr) {
                // Tìm đúng object ProductAttributeValue đã tạo ở trên
                $matchedValue = $availableValues->first(function ($item) use ($vAttr) {
                    return $item['attribute'] === $vAttr['attribute']
                        && $item['value'] === $vAttr['value'];
                });

                if ($matchedValue) {
                    // productVariants() là quan hệ belongsToMany trong model ProductAttributeValue
                    // Ở đây ta dùng attach vào bảng trung gian product_variant_attribute_value
                    $variant->attributeValues()->attach($matchedValue['object']->id);
                }
            }
        }
    }
}
