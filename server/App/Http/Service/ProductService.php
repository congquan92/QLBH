<?php
namespace App\Http\Service;
use App\Enums\Status;
use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use App\Http\Mapper\ProductMapper;
use App\Http\Requests\Product\ProductCreationRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Responses\PageResponse;
use App\Http\Responses\Product\ProductResponse;
use App\Models\Attribute;
use App\Models\Category;
use App\Models\ImageProduct;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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

    public function findAllForAdmin(?string $keyword, ?Status $status, ?string $sort, int $page, int $size): PageResponse
    {
        // Bắt đầu Query
        $query = Product::query();

        // 1. Logic lọc theo trạng thái: 
        // Nếu có truyền $status thì lọc theo đó, nếu không thì lấy tất cả trừ DISABLED
        if ($status) {
            $query->where('status', $status->value);
        } else {
            $query->where('status', '!=', Status::DISABLED->value);
        }

        // 2. Logic sắp xếp
        $column = 'id';
        $direction = 'asc';
        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
        }
        $query->orderBy($column, $direction);

        // 3. Logic tìm kiếm
        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%");
            });
        }

        // 

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
        // 1. Lấy dữ liệu đã validate (nó chỉ chứa các trường bạn đã định nghĩa)
        $data = $req->validated();

        // 2. Tìm sản phẩm
        $product = Product::where('id', $data['id'])->firstOrFail();

        // 3. Xử lý logic logic đặc thù (nếu có)
        // Cập nhật trạng thái nếu request có truyền status
        if (isset($data['status'])) {
            $product->status = $data['status'];
        }

        // 4. Xử lý Media (dùng toán tử ba ngôi cho gọn)
        $product->url_video = $data['removeVideo'] ? null : ($data['video'] ?? $product->url_video);
        $product->url_image_cover = $data['removeCoverImage'] ? null : ($data['coverImage'] ?? $product->url_image_cover);

        // 5. Cập nhật các trường thông tin cơ bản
        // Lưu ý: nên dùng tên trường trong DB (snake_case) hoặc ánh xạ mảng data trước khi update
        $product->update([
            'name' => $data['name'] ?? $product->name,
            'description' => $data['description'] ?? $product->description,
            'list_price' => $data['listPrice'] ?? $product->list_price,
            'sale_price' => $data['salePrice'] ?? $product->sale_price,
            'category_id' => $data['categoryId'] ?? $product->category_id,
            'supplier_id' => $data['supplierId'] ?? $product->supplier_id,
        ]);

        return $product;
    }

    public function deleteAttribute(int $productId, array $attributeIds)
    {
        \DB::transaction(
            function () use ($productId, $attributeIds) {
                foreach ($attributeIds as $id) {
                    $productAttribute = ProductAttribute::where('product_id', $productId)
                        ->where('attribute_id', $id)
                        ->first();

                    if (!$productAttribute) {
                        throw new BusinessException(ErrorCode::BAD_REQUEST, "Thuộc tính ID $id không tồn tại hoặc không thuộc sản phẩm này!");
                    }

                    // Lấy các Value thuộc ProductAttribute này
                    $valueIds = ProductAttributeValue::where('product_attribute_id', $productAttribute->id)->pluck('id');

                    if ($valueIds->isNotEmpty()) {
                        // Xóa liên kết trong bảng trung gian (Hard delete link)
                        \DB::table('product_variant_attribute_value')
                            ->whereIn('product_attribute_value_id', $valueIds)
                            ->delete();

                        // Xóa các ProductAttributeValue
                        ProductAttributeValue::whereIn('id', $valueIds)->delete();
                    }

                    // Xóa ProductAttribute
                    $productAttribute->delete();
                }
                $this->cleanupOrphanVariants($productId);
            }
        );
    }

    public function deleteAttributeValue(int $productId, array $attributeValueIds)
    {
        \DB::transaction(function () use ($productId, $attributeValueIds) {
            foreach ($attributeValueIds as $id) {
                // Dùng load() để lấy quan hệ productAttribute kèm thông tin product nếu cần
                $attributeValue = ProductAttributeValue::with('productAttribute', 'productVariants')->find($id);

                if (!$attributeValue)
                    continue;

                // Kiểm tra: Giá trị này có thuộc đúng ProductAttribute của đúng Product không?
                if ($attributeValue->productAttribute->product_id !== $productId) {
                    throw new BusinessException(ErrorCode::BAD_REQUEST, "Giá trị ID $id không thuộc sản phẩm này!");
                }

                // 1. Xóa liên kết bảng trung gian
                $attributeValue->productVariants()->detach();

                // 2. Xóa các biến thể liên quan (Hard delete)
                foreach ($attributeValue->productVariants as $variant) {
                    $variant->delete();
                }

                // 3. Xóa chính giá trị
                $attributeValue->delete();
            }
        });
    }
    public function cleanupOrphanVariants(int $productId)
    {
        // Lấy tất cả biến thể của sản phẩm
        $variants = ProductVariant::where('product_id', $productId)->get();

        foreach ($variants as $variant) {
            // Kiểm tra xem biến thể này còn liên kết với bất kỳ giá trị thuộc tính nào không
            $hasAttributes = \DB::table('product_variant_attribute_value')
                ->where('product_variant_id', $variant->id)
                ->exists();

            // Nếu không còn thuộc tính nào, biến thể này không còn ý nghĩa -> Xóa cứng
            if (!$hasAttributes) {
                $variant->delete();
            }
        }
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
            ->firstOrFail();
        $product->status = Status::DISABLED;
        $product->save();
    }

    public function getProductById(int $productId): ProductResponse
    {
        $product = Product::where('id', $productId)
            ->firstOrFail();
        return ProductMapper::toDetailResponse($product);
    }

    public function addVariants(int $productId, array $requests): void
    {
        $product = Product::where('id', $productId)
            ->where('status', Status::ACTIVE)
            ->firstOrFail();

        \DB::transaction(function () use ($product, $requests) {
            foreach ($requests as $req) {
                // Kiểm tra biến thể tồn tại
                if ($this->checkVariantExists($product, $req)) {
                    continue;
                }

                // Tạo biến thể cơ sở
                $variant = $this->makeBaseProductVariant($req, $product);

                foreach ($req['variantAttributes'] as $item) {
                    // Sử dụng ID từ request thay vì tìm theo tên
                    $attributeId = $item['attributeId'];

                    // Tìm hoặc tạo ProductAttribute bằng ID
                    $productAttribute = ProductAttribute::firstOrCreate([
                        'product_id' => $product->id,
                        'attribute_id' => $attributeId
                    ]);

                    // Tạo giá trị thuộc tính
                    $value = ProductAttributeValue::create([
                        'product_attribute_id' => $productAttribute->id,
                        'value' => $item['value'],
                        'url_image' => $item['image'] ?? null
                    ]);

                    // Gắn vào biến thể
                    $variant->attributeValues()->attach($value->id);
                }
            }
        });
    }
    public function updateVariants(int $productId, int $variantId, array $data)
{
    \DB::transaction(function () use ($productId, $variantId, $data) {
        $variant = ProductVariant::where('id', $variantId)
            ->where('product_id', $productId)
            ->firstOrFail();

        // 1. Lưu ảnh cũ của biến thể để phục vụ việc dọn dẹp sau này
        $oldImageUrls = $variant->attributeValues()->pluck('url_image')->filter()->toArray();

        // 2. Cập nhật thông tin cơ bản của biến thể
        $variant->update([
            'sku'    => $data['sku'] ?? $variant->sku,
            'price'  => $data['price'] ?? $variant->price,
            'weight' => $data['weight'] ?? $variant->weight,
            'length' => $data['length'] ?? $variant->length,
            'width'  => $data['width'] ?? $variant->width,
            'height' => $data['height'] ?? $variant->height,
        ]);

        // 3. Xử lý thuộc tính (Update tại chỗ)
        if (isset($data['variantAttributes'])) {
            $newAttributeValueIds = [];

            foreach ($data['variantAttributes'] as $item) {
                // Đảm bảo ProductAttribute tồn tại cho sản phẩm này
                $productAttribute = ProductAttribute::firstOrCreate([
                    'product_id' => $productId,
                    'attribute_id' => $item['attributeId']
                ]);

                // Tìm hoặc cập nhật giá trị thuộc tính. 
                // Quan trọng: UpdateOrCreate dựa trên cả product_attribute_id VÀ value
                $value = ProductAttributeValue::updateOrCreate(
                    [
                        'product_attribute_id' => $productAttribute->id,
                        'value' => $item['value'] // Nếu value đổi, nó sẽ tìm bản ghi cũ hoặc tạo mới
                    ],
                    [
                        'url_image' => $item['image'] ?? null
                    ]
                );
                
                $newAttributeValueIds[] = $value->id;
            }

            // Sync: Laravel sẽ tự so sánh ID cũ/mới. 
            // Nó giữ lại liên kết với ID mới và xóa các liên kết cũ không có trong danh sách.
            $variant->attributeValues()->sync($newAttributeValueIds);

            // 4. Dọn dẹp rác sau khi đã sync
            $this->cleanupOrphanValues();
            $this->cleanupUnusedImages($oldImageUrls);
        }
    });
}
private function cleanupOrphanValues()
{
    // Xóa tất cả các bản ghi ProductAttributeValue không còn được liên kết với bất kỳ biến thể nào
    ProductAttributeValue::whereDoesntHave('productVariants')->delete();
}

private function cleanupUnusedImages(array $oldImageUrls)
{
    foreach ($oldImageUrls as $url) {
        // Chỉ xóa trên Cloud nếu URL đó không còn tồn tại trong bất kỳ bản ghi nào trong DB
        if (!ProductAttributeValue::where('url_image', $url)->exists()) {
            try {
                app(CloudinaryService::class)->deleteByUrls([$url]);
            } catch (\Exception $e) {
                \Log::error("Lỗi xóa ảnh cloud: " . $e->getMessage());
            }
        }
    }
}
    private function checkVariantExists($product, $variantReq): bool
    {
        // Dùng get() thay vì firstOrFail() để tránh lỗi 404 khi chưa có biến thể nào
        $existingVariants = ProductVariant::where('product_id', $product->id)
            ->where('status', Status::ACTIVE)
            ->get();

        // Nếu không có biến thể nào, trả về false ngay (chưa tồn tại)
        if ($existingVariants->isEmpty()) {
            return false;
        }

        $reqAttributes = collect($variantReq['variantAttributes'])
            ->map(fn($item) => trim($item['attributeId']) . ':' . trim($item['value']))
            ->sort()
            ->values()
            ->toArray();

        foreach ($existingVariants as $variant) {
            $variantAttributes = $variant->attributeValues->map(function ($av) {
                return trim($av->productAttribute->attribute_id) . ':' . trim($av->value);
            })->sort()->values()->toArray();

            if ($variantAttributes === $reqAttributes) {
                return true;
            }
        }

        return false;
    }
    private function processAttributes(Product $product, array $attributesData)
    {
        $allCreatedValues = collect();

        foreach ($attributesData as $attrReq) {

            $attribute = Attribute::firstOrCreate(['name' => $attrReq['name']]);

            $productAttribute = ProductAttribute::firstOrCreate([
                'product_id' => $product->id,
                'attribute_id' => $attribute->id
            ]);

            foreach ($attrReq['attributeValue'] as $valReq) {
                $value = ProductAttributeValue::create([
                    'product_attribute_id' => $productAttribute->id,
                    'value' => $valReq['value'],
                    'url_image' => isset($valReq['image']) ? $valReq['image'] : null,
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

    private function makeBaseProductVariant($variantReq, Product $product): ProductVariant
    {
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => $variantReq['sku'] ?? uniqid('SKU_'),
            'price' => $variantReq['price'],
            'height' => $variantReq['height'],
            'width' => $variantReq['width'],
            'length' => $variantReq['length'],
            'weight' => $variantReq['weight'],
        ]);
        return $variant;
    }
    private function processVariants(Product $product, $availableValues, array $variantsData)
    {
        foreach ($variantsData as $variantReq) {

            Log::info('variantReq ', $variantReq);
            $variant = $this->makeBaseProductVariant($variantReq, $product);

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
