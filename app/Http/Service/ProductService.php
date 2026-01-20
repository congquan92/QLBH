<?php
namespace App\Http\Service;
use App\Enums\Status;
use App\Http\Mapper\ProductMapper;
use App\Http\Requests\Product\ProductCreationRequest;
use App\Http\Requests\product\UpdateProductRequest;
use App\Http\Responses\PageResponse;
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

    public function findAll(?string $keyword, ?string $sort, int $page, int $size): PageResponse
    {

        $query = Product::where('status', Status::ACTIVE);


        $column = 'id';
        $direction = 'asc';
        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
        }
        $query->orderBy($column, $direction);


        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%");
            });
        }


        $paginator = $query->paginate($size, ['*'], 'page', $page);


        $dtoItems = $paginator->getCollection()->map(function ($product) {
            return ProductMapper::toBaseResponse($product);
        });


        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }

    public function findAllForSale(?string $sort, int $page, int $size): PageResponse
    {

        $query = Product::where('status', Status::ACTIVE)
            ->selectRaw('*, (list_price - sale_price) as discount_diff');


        $column = 'id';
        $direction = 'asc';

        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';

            if ($column === 'discount') {
                $column = 'discount_diff';
            }
            $query->orderBy($column, $direction);
        } else {

            $query->orderBy('discount_diff', 'desc');
        }

        $paginator = $query->paginate($size, ['*'], 'page', $page);

        $dtoItems = $paginator->getCollection()->map(function ($product) {
            return ProductMapper::toBaseResponse($product);
        });
        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }

    public function findAllByCategory(int $categoryId, ?string $keyword, ?string $sort, int $page, int $size): PageResponse
    {
        $category = Category::findOrFail($categoryId);
        $categoryIds = $category->getAllChildIds();

        $query = Product::where('status', Status::ACTIVE)
            ->whereIn('category_id', $categoryIds);


        if (!empty($keyword)) {
            $query->where('name', 'like', "%{$keyword}%");
        }

        $column = 'id';
        $direction = 'asc';
        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
        }
        $query->orderBy($column, $direction);


        $paginator = $query->paginate($size, ['*'], 'page', $page);

        $paginator->setCollection(
            $paginator->getCollection()->map(fn($p) => ProductMapper::toBaseResponse($p))
        );

        return PageResponse::fromLaravelPaginator($paginator);
    }

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
                $this->createDefaultVariantForProduct($product, $req);
            }

            return $product;
        });
    }

    public function update(UpdateProductRequest $req)
    {
        $product = Product::where('id', $req->id)
            ->where('status', Status::ACTIVE)
            ->firstOrFail();

        $data = [
            'name' => $req->name,
            'description' => $req->description,
            'list_price' => $req->listPrice,
            'sale_price' => $req->salePrice,
            'category_id' => $req->categoryId,
            'supplier_id' => $req->supplierId,
            'url_video' => $req->removeVideo ? null : ($req->video ?? $product->url_video),
            'url_image_cover' => $req->removeCoverImage ? null : ($req->coverImage ?? $product->url_image_cover),
        ];

        $product->update(array_filter($data, fn($value) => !is_null($value)));
        return $product;
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

    public function restoreProduct(int $productId): void
    {
        $product = Product::where('id', $productId)
            ->where('status', Status::INACTIVE)
            ->firstOrFail();
        $product->status = Status::ACTIVE;
        $product->save();
    }
    public function deleteProduct(int $productId): void
    {
         $product = Product::where('id', $productId)
            ->where('status', Status::ACTIVE)
            ->firstOrFail();
        $product->status = Status::INACTIVE;
        $product->save(); 
    }

    // public function getProductById(int $productId): Product
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

            $variant = ProductVariant::create([
                'product_id' => $product->id,
                'sku' => $variantReq['sku'] ?? uniqid('SKU_'),
                'price' => $variantReq['price'],
                'height' => $variantReq['height'],
                'width' => $variantReq['width'],
                'length' => $variantReq['length'],
                'weight' => $variantReq['weight'],
            ]);

            foreach ($variantReq['variantAttributes'] as $vAttr) {
                $matchedValue = $availableValues->first(function ($item) use ($vAttr) {
                    return $item['attribute'] === $vAttr['attribute']
                        && $item['value'] === $vAttr['value'];
                });

                if ($matchedValue) {
                    $variant->attributeValues()->attach($matchedValue['object']->id);
                }
            }
        }
    }
    private function createDefaultVariantForProduct($product, $req)
    {
        ProductVariant::create([
            'product_id' => $product->id,
            'price' => $product->sale_price,
            'sku' => uniqid('SKU_'),
            'height' => $req['height'],
            'width' => $req['width'],
            'length' => $req['length'],
            'weight' => $req['weight'],
        ]);
    }
}
