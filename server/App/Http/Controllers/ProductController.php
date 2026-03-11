<?php

namespace App\Http\Controllers;

use App\Enums\Status;
use App\Http\Requests\Product\ProductCreationRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Service\ProductService;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


class ProductController extends Controller
{
    use ApiResponse;
    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }
    public function findAll(Request $request)
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $result = $this->productService->findAll($keyword, $sort, $page, $size);
        return $this->success($result, 'Product list fetched successfully');
    }

    public function findAllForAdmin(Request $request)
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort');
        $status = $request->query('status');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $result = $this->productService->findAllForAdmin($keyword, $status, $sort, $page, $size);
        return $this->success($result, 'Product list fetched successfully');
    }

    public function findAllForSale(Request $request)
    {
        $sort = $request->query('sort');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $result = $this->productService->findAllForSale($sort, $page, $size);

        return $this->success($result, 'Product list fetched successfully');
    }

    public function findAllByCategory(Request $request, $id)
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $result = $this->productService->findAllByCategory($id, $keyword, $sort, $page, $size);
        return $this->success($result, 'Product list fetched successfully');
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function addVariants($id, Request $request)
    {
        $this->productService->addVariants((int) $id, $request->all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductCreationRequest $request)
    {
        $this->productService->create($request);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        //
    }

    public function deleteAttribute(int $id, Request $request)
    {
        $attributeIds = $request->input('attributeIds');
        $this->productService->deleteAttribute($id, $attributeIds);
    }

    public function deleteAttributeValue(int $id, Request $request)
    {
        $attributeValueIds = $request->input('attributeValueIds');
        $this->productService->deleteAttributeValue($id, $attributeValueIds);
    }


    public function getProductById($productId)
    {
        Log::info('ProductController');
        $product = $this->productService->getProductById($productId);
        return $this->success($product, 'Product detail fetched successfully');
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function updateProduct(UpdateProductRequest $request)
    {
        Log::info("KKKK");
        $this->productService->update($request);
    }

    public function restoreProduct($productId)
    {
        $this->productService->restoreProduct($productId);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($productId)
    {
        $this->productService->deleteProduct($productId);
    }

    public function updateVariants($productId, Request $request)
    {
        // 1. Validation dữ liệu đầu vào
        $request->validate([
            'variantId' => 'required|exists:product_variants,id',
            'sku'       => 'nullable|string|max:50',
            'price'     => 'required|numeric|min:0',
            'weight'    => 'required|numeric|min:0',
            'variantAttributes' => 'required|array',
            'variantAttributes.*.attributeId' => 'required|exists:attributes,id',
            'variantAttributes.*.value' => 'required|string',
        ]);

        // 2. Gọi Service xử lý logic cập nhật
        try {
            $this->productService->updateVariants((int)$productId, (int)$request->variantId, $request->all());
            
            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật biến thể thành công!'
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }
}
