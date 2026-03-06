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

        $result = $this->productService->findAllForAdmin($keyword,$status, $sort, $page, $size);
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

        $result = $this->productService->findAllByCategory($id,$keyword, $sort, $page, $size);
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
    public function addVariants($productId, array $requests)
    {
        $this->productService->addVariants($productId, $requests);
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

    public function deleteAttribute(int $id , Request $request){
        $attributeIds = $request->input('attributeIds');
        $this->productService->deleteAttribute($id, $attributeIds);
    }

     public function deleteAttributeValue(int $id , Request $request){
        $attributeValueIds = $request->input('attributeValueIds');
        $this->productService->deleteAttributeValue($id, $attributeValueIds);
    }


    public function getProductById($productId){
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
}
