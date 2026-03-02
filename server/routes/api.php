<?php

use App\Http\Controllers\ExportController;
use App\Http\Controllers\FirebaseController;
use App\Http\Controllers\GroupPermissionController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\JobHistoryController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\SalaryConfigController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\SalaryScaleController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\StatisticalController;
use App\Http\Controllers\UploadFileController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrevoController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OAuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WebAuthn\WebAuthnLoginController;
use App\Http\Controllers\WebAuthn\WebAuthnRegisterController;
use App\Http\Controllers\WebAuthn\WebAuthnController;
use App\Http\Controllers\RoleController;


// ==========================================
// Route public
// ==========================================
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/product/list', [ProductController::class, 'findAll']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/product/detail/{productId}', [ProductController::class, 'getProductById']);
Route::post('/order/add', [OrderController::class, 'store']);
Route::get('/category/all', [CategoryController::class, 'findAllWithouPagination']);
Route::get('/product/category/{id}', [ProductController::class, 'findAllByCategory']);
Route::post('/firebase/test', [FirebaseController::class, 'test']);
Route::post('/auth/social/google', [OAuthController::class, 'googleLogin']);

// ==========================================
// Route bảo vệ bởi JWT
// ==========================================
Route::middleware('auth')->group(function () {
    
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/introspect', [AuthController::class, 'introspect']);

    // User Management
    Route::get('/user/list', [UserController::class, 'list'])->middleware('can:VIEW_USERS');
    Route::get('/user/me', [UserController::class, 'getMyInfo']);
    Route::get('/user/{userId}', [UserController::class, 'getDetailUser'])->middleware('can:VIEW_USER_DETAIL');
    Route::post('/user/add', [UserController::class, 'createUser'])->middleware('can:CREATE_USER');
    Route::put('/user/{userId}/update/role', [UserController::class, 'updateRoleUser'])->middleware('can:ASSIGN_ROLE');
    
    // Address (Thường cho phép User tự quản lý)
    Route::post('/user/add/address', [UserController::class, 'createAddress']);
    Route::get('/user/address/list', [UserController::class, 'getAllAddresses']);
    Route::put('/user/address/default/{addressId}', [UserController::class, 'updateDefaultAddress']);
    Route::put('/user/address/update/{addressId}', [UserController::class, 'updateAddress']);
    Route::delete('/user/address/delete/{addressId}', [UserController::class, 'deleteAddress']);
    
    // Account Security
    Route::post('/user/{userId}/verify-account', [UserController::class, 'verifyAccount'])->middleware('can:VERIFY_ACCOUNT');
    Route::put('/user/change-email', [UserController::class, 'changeEmail']);
    Route::put('/user/change-phone', [UserController::class, 'changePhone']);
    Route::put('/user/change-password', [UserController::class, 'changePassword']);
    Route::get('/user/email', [UserController::class, 'getUserByEmail'])->middleware('can:VIEW_USERS');
    Route::post('/user/forgot-password', [UserController::class, 'forgotPassword']);
    Route::get('/user/username', [UserController::class, 'findByUserName'])->middleware('can:VIEW_USERS');

    // Category
    Route::prefix('category')->group(function () {
        Route::get('/list', [CategoryController::class, 'findAll']);
        Route::post('/add', [CategoryController::class, 'store'])->middleware('can:CREATE_CATEGORIES');
        Route::post('/{categoryId}/restore', [CategoryController::class, 'restoreCategory'])->middleware('can:RESTORE_CATEGORIES');
        Route::post('/move', [CategoryController::class, 'moveCategory'])->middleware('can:UPDATE_CATEGORIES');
        Route::put('/update', [CategoryController::class, 'updateCategory'])->middleware('can:UPDATE_CATEGORIES');
        Route::delete('/{categoryId}/delete', [CategoryController::class, 'deleteCategory'])->middleware('can:DELETE_CATEGORIES');
        Route::get('/{categoryId}', [CategoryController::class, 'getDetailCategory']);
        Route::get('/{categoryId}/parents', [CategoryController::class, 'getParentCategory']);
    });

    // Product
    Route::prefix('product')->group(function () {
        Route::get('/list/sale', [ProductController::class, 'findAllForAdmin'])->middleware('can:VIEW_PRODUCTS_ADMIN');
        Route::post('/add', [ProductController::class, 'store'])->middleware('can:CREATE_PRODUCT');
        Route::put('/update', [ProductController::class, 'updateProduct'])->middleware('can:UPDATE_PRODUCT');
        Route::get('/admin/detail/{productId}', [ProductController::class, 'getProductByIdForAdmin'])->middleware('can:VIEW_PRODUCTS_ADMIN');
        Route::post('/{productId}/restore', [ProductController::class, 'restoreProduct'])->middleware('can:RESTORE_PRODUCT');
        Route::post('/{productId}/variants/add', [ProductController::class, 'addVariants'])->middleware('can:UPDATE_PRODUCT');
        Route::put('/{productId}/variants/update', [ProductController::class, 'updateVariants'])->middleware('can:UPDATE_PRODUCT');
        Route::delete('/{productId}/delete', [ProductController::class, 'destroy'])->middleware('can:DELETE_PRODUCT');
        Route::delete('/{id}/attribute/delete', [ProductController::class, 'deleteAttribute'])->middleware('can:DELETE_PRODUCT');
        Route::delete('/{id}/attributeValue/delete', [ProductController::class, 'deleteAttributeValue'])->middleware('can:DELETE_PRODUCT');
    });

    // Files
    Route::post('/file/upload', [UploadFileController::class, 'upload']);
    Route::delete('/file/delete', [UploadFileController::class, 'delete']);

    // Supplier
    Route::post('/supplier/add', [SupplierController::class, 'store'])->middleware('can:ADD_SUPPLIER');

    // WebAuthn
    Route::post('/webauthn/register/options', [WebAuthnRegisterController::class, 'options']);
    Route::post('/webauthn/register', [WebAuthnRegisterController::class, 'register']);
    Route::post('/webauthn/login/options', [WebAuthnLoginController::class, 'options']);
    Route::post('/webauthn/login', [WebAuthnController::class, 'recordAttendance']);
    Route::get('/webauthn/list', [WebAuthnController::class, 'WebAuthnList']);
    Route::post('/webauthn/delete/{id}', [WebAuthnController::class, 'delete']);

    // Order
    Route::get("/order/list", [OrderController::class, 'findAll']);
    Route::get("/order/admin/list", [OrderController::class, 'findAllByAdmin'])->middleware('can:VIEW_ORDERS_ADMIN');
    Route::post("/order/changestatus/{id}/{status}", [OrderController::class, 'updateStatus'])->middleware('can:UPDATE_ORDER_STATUS');
    Route::put("/complete/{id}", [OrderController::class, 'completeOrder'])->middleware('can:UPDATE_ORDER_STATUS');
    Route::get("/order/{id}", [OrderController::class, 'getOrderById']);
    Route::get('/order/admin/{id}', [OrderController::class, 'getOrderByIdForAdmin'])->middleware('can:VIEW_ORDERS_ADMIN');
    Route::delete('/order/cancel/{id}', [OrderController::class, 'cancelOrder']);

    // Notifications
    Route::post('/notifications/send/mail', [BrevoController::class, 'sendOTP']);

    // Schedules
    Route::prefix('schedules')->group(function () {
        Route::get('/weekly-report', [ScheduleController::class, 'weeklyReport'])->middleware('can:VIEW_SCHEDULE_REPORT');
        Route::get('/daily', [ScheduleController::class, 'dailyStaff'])->middleware('can:VIEW_DAILY_SCHEDULE');
        Route::get('/weekly/{userId}', [ScheduleController::class, 'weeklyEmployee'])->middleware('can:VIEW_DAILY_SCHEDULE');
        Route::post('/positions/{positionId}/default', [ScheduleController::class, 'setPositionDefaultSchedule'])->middleware('can:SET_DEFAULT_SCHEDULE');
        Route::get('/positions/{positionId}', [ScheduleController::class, 'getPositionSchedule']);
        Route::post('/assignments', [ScheduleController::class, 'store'])->middleware('can:ASSIGN_SHIFT');
        Route::put('/{id}', [ScheduleController::class, 'updateAssignment'])->middleware('can:ASSIGN_SHIFT');
        Route::delete('/assignments', [ScheduleController::class, 'destroy'])->middleware('can:DELETE_SHIFT_ASSIGNMENT');
        Route::get('/my-schedule', [ScheduleController::class, 'mySchedule']);
    });

    // Leave Requests
    Route::prefix('leave-requests')->group(function () {
        Route::get('/list', [LeaveController::class, 'index'])->middleware('can:VIEW_LEAVE_LIST');
        Route::get('/me', [LeaveController::class, 'myLeaves']);
        Route::post('/', [LeaveController::class, 'store']);
        Route::post('/{id}/status', [LeaveController::class, 'updateStatus'])->middleware('can:APPROVE_LEAVE');
        Route::delete('/{id}', [LeaveController::class, 'destroy']);
    });

    // Shifts
    Route::prefix('shifts')->group(function () {
        Route::get('/list', [ShiftController::class, 'index']);
        Route::post('/', [ShiftController::class, 'store'])->middleware('can:CREATE_SHIFT');
        Route::put('/{id}', [ShiftController::class, 'update'])->middleware('can:UPDATE_SHIFT');
        Route::delete('/{id}', [ShiftController::class, 'destroy'])->middleware('can:DELETE_SHIFT');
    });

    // Job History
    Route::prefix('job-history')->group(function () {
        Route::post('/promote/{userId}', [JobHistoryController::class, 'promote'])->middleware('can:PROMOTE_EMPLOYEE');
        Route::get('/career/{id}', [JobHistoryController::class, 'showCarrerById'])->middleware('can:VIEW_USERS');
        Route::get('/my-career', [JobHistoryController::class, 'showCarrerMe']);
    });

    // Export
    Route::prefix('export')->group(function () {
        Route::get('/schedule', [ExportController::class, 'exportSchedule'])->middleware('can:EXPORT_DATA');
        Route::get('/my-schedule', [ExportController::class, 'exportMySchedule']);
    });

    // Holidays
    Route::prefix('holidays')->group(function () {
        Route::get('/list', [HolidayController::class, 'index']);
        Route::post('/', [HolidayController::class, 'store'])->middleware('can:MANAGE_HOLIDAYS');
        Route::put('/{id}', [HolidayController::class, 'update'])->middleware('can:MANAGE_HOLIDAYS');
        Route::delete('/{id}', [HolidayController::class, 'destroy'])->middleware('can:MANAGE_HOLIDAYS');
    });

    // Positions
    Route::prefix('positions')->group(function () {
        Route::get('/', [PositionController::class, 'index']);
        Route::post('/', [PositionController::class, 'store'])->middleware('can:CREATE_POSITION');
        Route::put('{id}', [PositionController::class, 'update'])->middleware('can:UPDATE_POSITION');
        Route::delete('{id}', [PositionController::class, 'destroy'])->middleware('can:DELETE_POSITION');
        Route::get('{id}/employees', [PositionController::class, 'getEmployees'])->middleware('can:VIEW_USERS');
    });

    // Salary Configs
    Route::prefix('salary-configs')->group(function () {
        Route::get('/list', [SalaryConfigController::class, 'findAll']);
        Route::post('/', [SalaryConfigController::class, 'add'])->middleware('can:CREATE_SALARY_CONFIG');
        Route::put('/{id}', [SalaryConfigController::class, 'update'])->middleware('can:UPDATE_SALARY_CONFIG');
        Route::delete('/{id}', [SalaryConfigController::class, 'delete'])->middleware('can:DELETE_SALARY_CONFIG');
    });

    // Salary Scales
    Route::prefix('salary-scales')->group(function () {
        Route::get('/list', [SalaryScaleController::class, 'index']);
        Route::post('/', [SalaryScaleController::class, 'store'])->middleware('can:MANAGE_SALARY_SCALES');
        Route::put('/{id}', [SalaryScaleController::class, 'update'])->middleware('can:MANAGE_SALARY_SCALES');
        Route::delete('/{id}', [SalaryScaleController::class, 'destroy'])->middleware('can:MANAGE_SALARY_SCALES');
    });

    // Payment
    Route::prefix('payment')->group(function () {
        Route::post('/{orderId}/add', [PaymentController::class, 'addPayment']);
        Route::get('/vnpay-return', [PaymentController::class, 'returnPayment'])->name('vnpay.return');
    });

    // RBAC: Roles
    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->middleware('can:VIEW_ROLES');
        Route::post('/', [RoleController::class, 'store'])->middleware('can:CREATE_ROLE');
        Route::get('/{id}', [RoleController::class, 'show'])->middleware('can:VIEW_ROLES');
        Route::put('/{id}', [RoleController::class, 'update'])->middleware('can:UPDATE_ROLE');
        Route::delete('/{id}', [RoleController::class, 'destroy'])->middleware('can:DELETE_ROLE');
        Route::post('/{id}/detach-groups', [RoleController::class, 'detachGroups'])->middleware('can:UPDATE_ROLE');
    });

    // RBAC: Group Permissions
    Route::prefix('group-permissions')->group(function () {
        Route::get('/', [GroupPermissionController::class, 'index'])->middleware('can:VIEW_PERMISSION_GROUPS');
        Route::post('/', [GroupPermissionController::class, 'store'])->middleware('can:CREATE_PERMISSION_GROUP');
        Route::get('/{id}', [GroupPermissionController::class, 'show'])->middleware('can:VIEW_PERMISSION_GROUPS');
        Route::put('/{id}', [GroupPermissionController::class, 'update'])->middleware('can:UPDATE_PERMISSION_GROUP');
        Route::delete('/{id}', [GroupPermissionController::class, 'destroy'])->middleware('can:DELETE_PERMISSION_GROUP');
        Route::post('/{id}/detach-permissions', [GroupPermissionController::class, 'detachPermissions'])->middleware('can:UPDATE_PERMISSION_GROUP');
    });

    // --- NHÓM THỐNG KÊ (Statistical) ---
    Route::prefix('statistical')->middleware('can:VIEW_STATISTICAL')->group(function () {
        Route::get('/users', [StatisticalController::class, 'getActiveUser']);
        Route::get('/orders', [StatisticalController::class, 'getOrders']);
        Route::get('/revenue-12months', [StatisticalController::class, 'getRevenue12Months']);
        Route::get('/top-products', [StatisticalController::class, 'getTopProducts']);
        Route::get('/categories', [StatisticalController::class, 'getCategories']);
    });

    // Salaries
    Route::get('salaries/calculate/{userId}', [SalaryController::class, 'calculateMonthlySalary'])->middleware('can:CALCULATE_SALARY');
    Route::get('salaries/calculate/me', [SalaryController::class, 'calculateMonthlySalary']);
});