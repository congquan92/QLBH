<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SupplierController;
use App\Http\Middleware\JwtAuthenticate;
use Illuminate\Support\Facades\Route;


// Route public
Route::post('/auth/login', [AuthController::class, 'login']);

// Route bảo vệ bởi JWT
Route::middleware('auth')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/introspect', [AuthController::class, 'introspect']);
    
    // Category
    Route::post('/category/add', [CategoryController::class, 'store']);

    //Product
     Route::post('/product/add', [ProductController::class, 'store']);


     //Supplier
     Route::post('/supplier/add', [SupplierController::class,'store']);

});