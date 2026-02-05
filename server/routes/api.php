<?php

use App\Http\Controllers\UploadFileController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrevoController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OAuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\JwtAuthenticate;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WebAuthn\WebAuthnLoginController;
use App\Http\Controllers\WebAuthn\WebAuthnRegisterController;
use App\Http\Controllers\WebAuthn\WebAuthnController;


// Route public
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/product/list', [ProductController::class, 'findAll']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/product/detail/{productId}', [ProductController::class, 'getProductById']);
Route::post('/order/add', [OrderController::class, 'store']);
Route::get('/category/all', [CategoryController::class, 'findAllWithouPagination']);
Route::get('/product/category/{id}', [ProductController::class, 'findAllByCategory']);
//google
Route::post('/auth/social/google', [OAuthController::class, 'googleLogin']);
// Route bảo vệ bởi JWT
Route::middleware('auth')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/introspect', [AuthController::class, 'introspect']);

    //User
    Route::get('/user/list', [UserController::class, 'list']);
    Route::get('/user/{userId}', [UserController::class, 'getDetailUser']);
    Route::get('/user/me', [UserController::class, 'getMyInfo']);
    Route::post('/user/add', [UserController::class, 'createUser']);
    Route::put('/user/{userId}/update/role', [UserController::class, 'updateRoleUser']);
    Route::post('/user/add/address', [UserController::class, 'createAddress']);
    Route::get('/user/address/list', [UserController::class, 'getAllAddresses']);
    Route::put('/user/address/default/{addressId}', [UserController::class, 'updateDefaultAddress']);
    Route::put('/user/address/update/{addressId}', [UserController::class, 'updateAddress']);
    Route::delete('/user/address/delete/{addressId}', [UserController::class, 'deleteAddress']);
    Route::post('/user/{userId}/verify-account', [UserController::class, 'verifyAccount']);
    Route::put('/user/change-email', [UserController::class, 'changeEmail']);
    Route::put('/user/change-phone', [UserController::class, 'changePhone']);
    Route::put('/user/change-password', [UserController::class, 'changePassword']);
    Route::get('/user/email', [UserController::class, 'getUserByEmail']);
    Route::post('/user/forgot-password', [UserController::class, 'forgotPassword']);
    Route::get('/user/username', [UserController::class, 'findByUserName']);
    // Category
    Route::post('/category/add', [CategoryController::class, 'store']);
    Route::get('/category/list', [CategoryController::class, 'findAll']);
    Route::post('/category/{categoryId}/restore', [CategoryController::class, 'restoreCategory']);
    Route::post('/category/move', [CategoryController::class, 'moveCategory']);
    Route::put('/category/update', [CategoryController::class, 'updateCategory']);
    Route::delete('/category/{categoryId}/delete', [CategoryController::class, 'deleteCategory']);
    Route::get('/category/{categoryId}', [CategoryController::class, 'getDetailCategory']);
    Route::get('/category/{categoryId}/parents', [CategoryController::class, 'getParentCategory']);
    //Product
    Route::get('/product/list/sale', [ProductController::class, 'findAllForAdmin']);
    Route::put('/product/update', [ProductController::class, 'updateProduct']);
    Route::get('/product/admin/detail/{productId}', [ProductController::class, 'getProductByIdForAdmin']);
    Route::post('/product/{productId}/restore', [ProductController::class, 'restoreProduct']);
    Route::post('/product/{productId}/variants/add', [ProductController::class, 'addVariants']);
    Route::put('/product/{productId}/variants/update', [ProductController::class, 'updateVariants']);

    Route::post('/product/add', [ProductController::class, 'store']);

    Route::delete('/product/{productId}/delete', [ProductController::class, 'destroy']);
    Route::delete('/product/{id}/attribute/delete', [ProductController::class, 'deleteAttribute']);
    Route::delete('/product/{id}/attributeValue/delete', [ProductController::class, 'deleteAttributeValue']);

    Route::post('/file/upload', action: [UploadFileController::class, 'upload']);
    Route::delete('/file/delete', action: [UploadFileController::class, 'delete']);
    //Supplier
    Route::post('/supplier/add', [SupplierController::class, 'store']);


    Route::post('/webauthn/register/options', [WebAuthnRegisterController::class, 'options']);
    Route::post('/webauthn/register', [WebAuthnRegisterController::class, 'register']);

    // Lấy challenge để login/xác thực điểm danh
    Route::post('/webauthn/login/options', [WebAuthnLoginController::class, 'options']);
    Route::post('/webauthn/login', [WebAuthnController::class, 'recordAttendance']);
    Route::get('/webauthn/list', [WebAuthnController::class, 'WebAuthnList']);
    Route::post('/webauthn/delete/{id}', [WebAuthnController::class, 'delete']);

    Route::post('/notifications/send/mail', [BrevoController::class, 'sendOTP']);
});