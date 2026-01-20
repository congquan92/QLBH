<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\ProductCreationRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Service\ProductService;
use App\Models\Product;
use Illuminate\Http\Request;


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

    public function findAllForSale(Request $request)
    {
        $sort = $request->query('sort');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $result = $this->productService->findAllForSale($sort, $page, $size);

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
    public function create()
    {
        //
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
    public function update(Request $request, Product $product)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        //
    }
}
