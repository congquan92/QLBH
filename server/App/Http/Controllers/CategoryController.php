<?php

namespace App\Http\Controllers;

use App\Http\Requests\Category\CategoryCreationRequest;
use App\Http\Requests\Category\CategoryUpdateRequest;
use App\Http\Requests\Category\MoveCategoryRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Category;
use App\Http\Service\CategoryService;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponse;
    protected CategoryService $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }
    public function findAll()
    {
        $result = $this->categoryService->findAll();
        return $this->success($result, 'Category list fetched successfully');
    }

    public function findAllWithouPagination(Request $request)
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort','id');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);

        $result = $this->categoryService->findAllWithPagination($page, $size,$keyword,$sort);
        return $this->success($result, 'Product list fetched successfully');
    }
    public function updateCategory(CategoryUpdateRequest $request){
        $this->categoryService->update($request);
    }

    public function restoreCategory($categoryId){
        $this->categoryService->restore($categoryId);
        return $this->success([],'category restored');
    }

    public function moveCategory(MoveCategoryRequest $request){
        $this->categoryService->moveCategory($request);
    }

    public function deleteCategory($categoryId){
        $this->categoryService->delete($categoryId);
    }
    public function getDetailCategory($categoryId){
        $result = $this->categoryService->getCategoryById($categoryId);
        return $this->success($result,'Category detail');
    }

     public function getParentCategory($categoryId){
        $result = $this->categoryService->getAllParentCategories($categoryId);
        return $this->success($result,'Category parent detail');
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
    public function store(CategoryCreationRequest $request)
    {
        $this->categoryService->create($request);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        //
    }
}
