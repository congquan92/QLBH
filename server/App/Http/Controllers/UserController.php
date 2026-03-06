<?php

namespace App\Http\Controllers;

use App\Http\Requests\Address\UserCreationAddressRequest;
use App\Http\Requests\Address\UserUpdateAddressRequest;
use App\Http\Requests\User\ForgotPasswordRequest;
use App\Http\Requests\User\UpdatePhoneRequest;
use App\Http\Requests\User\UserCreationRequest;
use App\Http\Requests\User\UserPasswordRequest;
use App\Http\Requests\User\UserUpdateRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Service\UserService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }
    public function findAll(Request $request)
    {
        $keyword = $request->query('keyword');
        $sort = $request->query('sort');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);
        $hasUserRole = $request->query('hasUserRole');
        $result = $this->userService->findAll($keyword, $sort, $page, $size, $hasUserRole);
        return $this->success($result, 'Product list fetched successfully');
    }

    public function getDetailUser($userId)
    {
        $result = $this->userService->findUserById($userId);
        return $this->success($result, 'Get detail user');
    }
    public function getMyInfo()
    {
        $result = $this->userService->getMyInfo();
        return $this->success($result, 'My info');
    }
    public function createUser(UserCreationRequest $request)
    {
        $result = $this->userService->save($request);
        return $this->success($result, 'Create user');
    }
    public function updateRoleUser(Request $request, $userId)
    {
        $roleId = $request->input('roleId');
        $this->userService->updateUserRole($userId, $roleId);
    }

    public function createAddress(UserCreationAddressRequest $request)
    {
        $this->userService->addAddress($request);
    }

    public function getAllAddresses(Request $request)
    {
        $sort = $request->query('sort');
        $page = (int) $request->query('page', 1);
        $size = (int) $request->query('size', 10);
        $result = $this->userService->findAllAddressUser($sort, $page, $size);
        return $this->success($result, 'Get addresses');
    }
    public function updateDefaultAddress($addressId)
    {
        $this->userService->setDefaultAddress($addressId);
    }

    public function updateAddress($addressId, UserUpdateAddressRequest $request)
    {
        $this->userService->updateAddress($addressId, $request);
    }

    public function deleteAddress($addressId)
    {
        $this->userService->deleteAddress($addressId);
    }
    public function updateUser(UserUpdateRequest $request)
    {
        $this->userService->update($request);
    }

    public function verifyAccount($userId, Request $request)
    {
        $otp = $request->input('otp');
        $isEmail = $request->input('isEmail');
        $this->userService->verifyAccount($userId, $otp, $isEmail);
    }
    public function changeEmail(Request $request)
    {
        $otp = $request->input('otp');
        $newEmail = $request->input('newEmail');
        $this->userService->changeEmail($newEmail, $otp);
    }

     public function changePhone(UpdatePhoneRequest $phoneRequest)
    {
        $this->userService->changePhone($phoneRequest);
    }

    public function changePassword(UserPasswordRequest $request){
        $this->userService->changePassword($request);
    }

    public function getUserByEmail(Request $request){
        $email = $request->input('email');
        $result = $this->userService->getAllUserByEmail($email);
         return $this->success($result, 'Get all user by email');
    }

    public function forgotPassword(ForgotPasswordRequest $request){
        $this->userService->forgotPassword($request);
    }
    public function findByUserName(Request $request){
        $username = $request->input('username');
        $result = $this->userService->findByUserName($username);
        return $this->success($result,'Get user by username');
    }

    // Thêm vào UserController.php

public function updateStatus(Request $request, $userId)
{
    // Validate cơ bản
    $request->validate([
        'status' => 'required|string' // Có thể validate theo Enum nếu muốn
    ]);

    $status = $request->input('status');
    $result = $this->userService->updateStatus($userId, $status);
    
    return $this->success($result, 'Cập nhật trạng thái người dùng thành công');
}
}
