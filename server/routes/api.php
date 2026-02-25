<?php

use App\Http\Controllers\ExportController;
use App\Http\Controllers\FirebaseController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\JobHistoryController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\SalaryConfigController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ShiftController;
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


// Route public
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/product/list', [ProductController::class, 'findAll']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/product/detail/{productId}', [ProductController::class, 'getProductById']);
Route::post('/order/add', [OrderController::class, 'store']);
Route::get('/category/all', [CategoryController::class, 'findAllWithouPagination']);
Route::get('/product/category/{id}', [ProductController::class, 'findAllByCategory']);
Route::post('/firebase/test', [FirebaseController::class, 'test']);
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

    //Order
    Route::get("/order/list", [OrderController::class, 'findAll']);
    Route::get("/order/admin/list", [OrderController::class, 'findAllByAdmin']);
    Route::post("/order/changestatus/{id}/{status}", [OrderController::class, 'updateStatus']);
    Route::put("/complete/{id}", [OrderController::class, 'completeOrder']);
    Route::get("/order/{id}", [OrderController::class, 'getOrderById']);
    Route::get('/order/admin/{id}', [OrderController::class, 'getOrderByIdForAdmin']);
    Route::delete('/order/cancel/{id}', [OrderController::class, 'cancelOrder']);
    //SalaryConfig
    Route::get('/salaryConfig/list', [SalaryConfigController::class, 'findAll']);
    Route::post('/salaryConfig/add', [SalaryConfigController::class, 'add']);
    Route::put('/salaryConfig/{id}/update', [SalaryConfigController::class, 'update']);
    Route::delete('/salaryConfig/{id}/delete', [SalaryConfigController::class, 'delete']);
    // Lấy challenge để login/xác thực điểm danh
    Route::post('/webauthn/login/options', [WebAuthnLoginController::class, 'options']);
    Route::post('/webauthn/login', [WebAuthnController::class, 'recordAttendance']);
    Route::get('/webauthn/list', [WebAuthnController::class, 'WebAuthnList']);
    Route::post('/webauthn/delete/{id}', [WebAuthnController::class, 'delete']);

    Route::post('/notifications/send/mail', [BrevoController::class, 'sendOTP']);

    // Nhóm các route về Lịch làm việc (Schedules)
    Route::prefix('schedules')->group(function () {

        // 1. Xem báo cáo quân số & danh sách nhân viên chi tiết cả tuần (MỚI THÊM)
        Route::get('/weekly-report', [ScheduleController::class, 'weeklyReport']);

        // 2. Xem lịch của TẤT CẢ nhân viên trong 1 ngày cụ thể
        Route::get('/daily', [ScheduleController::class, 'dailyStaff']);

        // 3. Xem lịch chi tiết theo tuần của 1 nhân viên cụ thể
        Route::get('/weekly/{userId}', [ScheduleController::class, 'weeklyEmployee']);

        // 4. Cài đặt lịch mặc định theo Chức vụ (T2-CN)
        Route::post('/positions/{positionId}/default', [ScheduleController::class, 'setPositionDefaultSchedule']);

        // 5. Phân công ca đặc biệt (ShiftAssignment)
        Route::post('/assignments', [ScheduleController::class, 'store']);

        Route::put('/{id}', [ScheduleController::class, 'updateAssignment']); // Sửa ca của nhân viên

        // 6. Xóa phân công ca đặc biệt
        Route::delete('/assignments', [ScheduleController::class, 'destroy']);
    });

    // Nhóm các route về Nghỉ phép (Leave Requests)
    Route::prefix('leave-requests')->group(function () {
        Route::get('/list', [LeaveController::class, 'index']);
        Route::post('/', [LeaveController::class, 'store']);                // Gửi đơn
        Route::post('/{id}/status', [LeaveController::class, 'updateStatus']); // Duyệt/Từ chối
        Route::delete('/{id}', [LeaveController::class, 'destroy']);         // Xóa đơn (chỉ khi PENDING)
    });

    Route::prefix('shifts')->group(function () {
        Route::get('/list', [ShiftController::class, 'index']);
        Route::post('/', [ShiftController::class, 'store']);
        Route::put('/{id}', [ShiftController::class, 'update']);
        Route::delete('/{id}', [ShiftController::class, 'destroy']);
    });

    // --- NHÓM QUẢN LÝ CHỨC VỤ & LỊCH SỬ CÔNG TÁC (Job History) ---
    Route::prefix('job-history')->group(function () {
        // Thăng chức/Thay đổi chức vụ nhân viên (Admin)
        Route::post('/promote/{userId}', [JobHistoryController::class, 'promote']);

        // Xem lộ trình sự nghiệp của nhân viên cụ thể (Admin)
        Route::get('/career/{id}', [JobHistoryController::class, 'showCarrerById']);

        // Nhân viên tự xem lộ trình sự nghiệp/thâm niên của mình (User)
        Route::get('/my-career', [JobHistoryController::class, 'showCarrerMe']);
    });

    // --- NHÓM XUẤT BÁO CÁO EXCEL/PDF (Export) ---
    Route::prefix('export')->group(function () {
        // Xuất bảng phân ca tổng hợp của tất cả nhân viên trong tuần (Admin)
        // Params: ?start_date=2026-02-23&type=excel|pdf
        Route::get('/schedule', [ExportController::class, 'exportSchedule']);

        // Nhân viên tự xuất thời khóa biểu cá nhân của tuần này (User)
        // Params: ?type=excel|pdf
        Route::get('/my-schedule', [ExportController::class, 'exportMySchedule']);
    });

    Route::prefix('holidays')->group(function () {
        Route::get('/list', [HolidayController::class, 'index']);          // Lấy danh sách + Phân trang + Tìm kiếm
        Route::post('/', [HolidayController::class, 'store']);         // Tạo mới ngày lễ
        Route::put('/{id}', [HolidayController::class, 'update']);     // Cập nhật ngày lễ
        Route::delete('/{id}', [HolidayController::class, 'destroy']); // Xóa ngày lễ
    });

    Route::prefix('positions')->group(function () {

        // Lấy danh sách chức vụ
        Route::get('/', [PositionController::class, 'index']);

        // Tạo chức vụ mới
        Route::post('/', [PositionController::class, 'store']);

        // Cập nhật thông tin chức vụ
        Route::put('{id}', [PositionController::class, 'update']);

        // Xóa hẳn một chức vụ
        Route::delete('{id}', [PositionController::class, 'destroy']);

        // Xem danh sách nhân viên thuộc chức vụ
        Route::get('{id}/employees', [PositionController::class, 'getEmployees']);

        // Gỡ chức vụ của một nhân viên 
        Route::delete('employees/{userId}', [PositionController::class, 'removeEmployee']);
    });
});