<?php 

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware(['auth:api'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/introspect', [AuthController::class, 'introspect']);
});

Route::middleware(['auth:api'])->group(function () {
    Route::post('/category/add', [CategoryController::class, 'store']);
});


