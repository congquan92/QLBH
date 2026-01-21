<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SupplierController;
use App\Http\Middleware\JwtAuthenticate;
use Illuminate\Support\Facades\Route;


// Route public
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/product/list', [ProductController::class, 'findAll']);
Route::get('/product/detail/{productId}', [ProductController::class, 'getProductById']);

// Route bảo vệ bởi JWT
Route::middleware('auth')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/introspect', [AuthController::class, 'introspect']);

    // Category
    Route::post('/category/add', [CategoryController::class, 'store']);

    //Product
    Route::get('/product/list/sale', [ProductController::class, 'findAllForAdmin']);
    Route::get('/product/category/{id}', [ProductController::class, 'findAllByCategory']);
    Route::get('/product/admin/detail/{productId}', [ProductController::class, 'getProductByIdForAdmin']);
    Route::post('/product/{productId}/restore', [ProductController::class, 'restoreProduct']);
     
    Route::post('/product/add', [ProductController::class, 'store']);

    Route::put('/product/update', [ProductController::class,'update']);
    
    Route::delete('/product/{productId}/delete', [ProductController::class, 'destroy']);





    //Supplier
    Route::post('/supplier/add', [SupplierController::class, 'store']);

});