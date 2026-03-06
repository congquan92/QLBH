<?php
namespace App\Http\Service;

use App\Enums\OTPType;
use App\Enums\Rank;
use App\Enums\SalaryType;
use App\Enums\Status;
use App\Enums\UserStatus;
use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use App\Http\Mapper\UserMapper;
use App\Http\Requests\Address\UserCreationAddressRequest;
use App\Http\Requests\Address\UserUpdateAddressRequest;
use App\Http\Requests\User\ForgotPasswordRequest;
use App\Http\Requests\User\UpdatePhoneRequest;
use App\Http\Requests\User\UserCreationRequest;
use App\Http\Requests\User\UserPasswordRequest;
use App\Http\Requests\User\UserUpdateRequest;
use App\Http\Responses\PageResponse;
use App\Models\Address;
use App\Models\JobHistory;
use App\Models\Position;
use App\Models\Role;
use App\Models\SalaryScale;
use App\Models\User;
use App\Models\UserRank;
use Hash;
use Illuminate\Support\Facades\DB;
use Log;
class UserService
{
    protected BrevoService $brevoService;

    public function __construct(BrevoService $brevoService)
    {
        $this->brevoService = $brevoService;
    }
    public function findAll(?string $keyword, ?string $sort, int $page, int $size, ?bool $hasUserRole): PageResponse
    {
        $currentUser = auth()->user();

        $query = User::query()->where('id', '!=', $currentUser->id);

        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $loweredKeyword = "%" . strtolower($keyword) . "%";
                $q->where('full_name', 'like', $loweredKeyword)
                    ->orWhere('email', 'like', $loweredKeyword)
                    ->orWhere('phone', 'like', $loweredKeyword)
                    ->orWhere('username', 'like', $loweredKeyword);
            });
        }
        if ($hasUserRole === true) {
            $query->whereRelation('role', 'name', 'USER');
        } elseif ($hasUserRole === false) {
            $query->whereRelation('role', 'name', '!=', 'USER');
        }

        $column = 'id';
        $direction = 'asc';
        if ($sort && str_contains($sort, ':')) {
            [$partsColumn, $partsDirection] = explode(':', $sort);
            $column = $partsColumn;
            $direction = strtolower($partsDirection) === 'asc' ? 'asc' : 'desc';
        }
        $query->orderBy($column, $direction);

        $paginator = $query->paginate($size, ['*'], 'page', $page);

        $dtoItems = $paginator->getCollection()->map(function ($user) {
            return UserMapper::toUserResponse($user);
        });

        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }
    public function save(UserCreationRequest $req): int
    {
        if (User::where('username', $req['username'])->exists()) {
            throw new BusinessException(ErrorCode::EXISTED, "Tên tài khoản đã tồn tại !");
        }

        return DB::transaction(function () use ($req) {
            $position = Position::findOrFail($req['positionId']);
            $userRank = UserRank::where('name', Rank::BRONZE->value)->first();
            if (!$userRank) {
                throw new BusinessException(ErrorCode::NOT_EXISTED, "Không tìm thấy mức hạng người dùng tương ứng !");
            }

            $user = new User();
            $user->full_name = $req['fullName'];
            $user->gender = $req['gender'];
            $user->date_of_birth = $req['dateOfBirth'];
            $user->email = $req['email'];
            $user->phone = $req['phone'];
            $user->username = $req['username'];
            $user->total_spent = 0;
            $user->password = Hash::make($req['password']);
            $user->status = UserStatus::ACTIVE;

            $role = Role::where('id', $req['roleId'])->where('status', Status::ACTIVE)->first();
            if (!$role) {
                throw new BusinessException(ErrorCode::NOT_EXISTED, 'Vai trò không tồn tại !');
            }
            $user->userRank()->associate($userRank);
            $user->role()->associate($role);

            $user->position_id = $position->id;

            $user->save();

            $coefficient = 1.0;
            if ($position->salary_type === SalaryType::MONTHLY) {
                $salaryScale = SalaryScale::where('years_of_experience', 0)->first();
                $coefficient = $salaryScale ? $salaryScale->coefficient : 1.0;
            }


            JobHistory::create([
                'user_id' => $user->id,
                'position_id' => $position->id,
                'current_salary' =>$position->base_salary * $coefficient,
                'employment_type' => $req['employmentType'],
                'effective_date' => now(),
                'end_date' => null,
            ]);
            return $user->id;
        });
    }
    public function update(UserUpdateRequest $req)
    {
        $currentUser = auth()->user();
        $map = [
            'fullName' => 'full_name',
            'gender' => 'gender',
            'dateOfBirth' => 'date_of_birth',
            'avatar' => 'avatar',
        ];

        foreach ($map as $reqKey => $dbColumn) {
            if ($req->filled($reqKey)) {
                $currentUser->{$dbColumn} = $req->input($reqKey);
            }
        }
        $currentUser->save();
    }
    public function changePassword(UserPasswordRequest $data): void
    {

        $currentUser = auth()->user();
        if (!Hash::check($data['oldPassword'], $currentUser->password)) {
            throw new BusinessException(ErrorCode::NOT_VERIFY, "Mật khẩu cũ không đúng !");
        }

        if ($data['password'] !== $data['confirmPassword']) {
            throw new BusinessException(ErrorCode::NOT_VERIFY, "Mật khẩu và Nhập lại mật khẩu không khớp !");
        }

        DB::transaction(function () use ($currentUser, $data) {
            $currentUser->password = Hash::make($data['password']);
            $currentUser->save();
        });
    }

    public function forgotPassword(ForgotPasswordRequest $req)
    {
        $user = User::where('id', $req['userId'])
            ->where('status', UserStatus::ACTIVE)
            ->firstOrFail();
        if ($req['sendEmail'] && !$user->email_verified) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'Email này chưua được xác thực !');
        } else {
            if (!$req['sendEmail'] && !$user->phone_verified) {
                throw new BusinessException(ErrorCode::BAD_REQUEST, 'Số điện thoại này chưua được xác thực !');
            }
        }
        $verifyOTP = $this->brevoService->verifyOTP($user, OTPType::PASSWORD_RESET, $req['otp']);
        if (!$verifyOTP) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'Xác thực OTP thất bại !');
        }
        if ($req['password'] !== $req['confirmPassword']) {
            throw new BusinessException(ErrorCode::NOT_VERIFY, "Mật khẩu và Nhập lại mật khẩu không khớp !");
        }
        DB::transaction(function () use ($user, $req) {
            $user->password = Hash::make($req['password']);
            $user->save();
        });
    }

    public function findByUserName($userName)
    {
        $user = User::where('id', $userName)
            ->where('status', UserStatus::ACTIVE)
            ->firstOrFail();
        return UserMapper::toUserResponse($user);
    }

    public function verifyAccount($userId, $otp, $isEmail)
    {
        $user = User::where('id', $userId)
            ->firstOrFail();
        $verifyOTP = $this->brevoService->verifyOTP($user, OTPType::VERIFICATION, $otp);
        if (!$verifyOTP) {
            throw new BusinessException(ErrorCode::NOT_VERIFY, 'Xác thực OTP thất bại!');
        } else {
            if ($isEmail) {
                $user->email_verified = true;
            } else {
                $user->phone_verified = true;
            }
            $user->status= UserStatus::ACTIVE;
            $user->save();
        }
    }

   public function getAllUserByEmail($email)
{
    // Chỉ lấy các cột cần thiết từ DB để nhẹ memory
    $users = User::where('email', $email)->get();

    if ($users->isEmpty()) {
        throw new BusinessException(ErrorCode::NOT_EXISTED, 'Không tìm thấy người dùng !');
    }

    return $users->map(function ($user) {
        return [
            "id"              => $user->id,
            "full_name"       => $user->full_name,
            "email"           => $user->email,
            "phone"           => $user->phone,
            "avatar"          => $user->avatar,
            // Xử lý Enum: Lấy giá trị chuỗi (ACTIVE, INACTIVE...)
            "status"          => $user->status?->value ?? $user->status,
            // Xử lý Enum Gender
            "gender"          => $user->gender?->value ?? $user->gender,
            // Ép kiểu boolean
            "email_verified"  => (bool) $user->email_verified,
            "phone_verified"  => (bool) $user->phone_verified,
            // Xử lý ngày sinh: Nếu null thì trả về chuỗi rỗng hoặc format chuẩn Y-m-d
            "date_of_birth"   => $user->date_of_birth ? $user->date_of_birth->format('Y-m-d') : null,
        ];
    })->toArray();
}

    public function changeEmail($newEmail, $otp)
    {
        $currentUser = auth()->user();
        $verifyOTP = $this->brevoService->verifyOTP($currentUser, OTPType::EMAIL_RESET, $otp);
        if (!$verifyOTP) {
            throw new BusinessException(ErrorCode::NOT_VERIFY, 'Xác thực thất bại!');
        }
        $currentUser->emai = $newEmail;
    }
    public function changePhone(UpdatePhoneRequest $req)
    {
        $currentUser = auth()->user();
        $verifyOTP = $this->brevoService->verifyOTP($currentUser, OTPType::PHONE_RESET, $req['otp']);
        if (!$verifyOTP) {
            throw new BusinessException(ErrorCode::NOT_VERIFY, 'Xác thực thất bại!');
        }
        $currentUser->phone = $req['new_phone'];
    }

    public function updateRank($user)
    {
        $rank = UserRank::where('status', Status::ACTIVE)
            ->where('min_spent', '<=', $user->total_spent)
            ->orderBy('min_spent', 'desc')
            ->first();
        if ($rank && $rank->id != $user->user_rank_id) {
            $user->user_rank_id = $rank->id;
            $user->save();
        }
    }
    public function findUserById($id)
    {
        $user = User::where('id', $id)->firstOrFail();
        return UserMapper::toUserResponse($user);
    }

    public function getMyInfo()
    {
        $currentUser = auth()->user();
        return UserMapper::toUserResponse($currentUser);
    }

    public function addAddress(UserCreationAddressRequest $req)
    {
        $currentUser = auth()->user();
        $newAddress = new Address();
        $newAddress->user_id = $currentUser->id;
        $newAddress->customer_name = $req->customer_name;
        $newAddress->address = $req->address;
        $newAddress->phone_number = $req->phone;
        $newAddress->province = $req->province;
        $newAddress->district = $req->district;
        $newAddress->ward = $req->ward;
        $newAddress->province_id = $req->province_id;
        $newAddress->district_id = $req->district_id;
        $newAddress->ward_id = $req->ward_id;
        $newAddress->address_type = $req->address_type;
        $newAddress->is_default = true;

        Address::where('user_id', $currentUser->id)->update(['is_default' => false]);
        $newAddress->save();
    }
    public function updateUserRole($userId, $roleId)
    {
        $user = User::where('id', $userId)
            ->where('status', UserStatus::ACTIVE)
            ->firstOrFail();
        $role = Role::where('id', $roleId)
            ->where('status', Status::ACTIVE)
            ->firstOrFail();
        $user->role_id = $role->id;
        $user->save();
    }
    public function updateAddress($addressId, UserUpdateAddressRequest $req)
    {
        $currentUser = auth()->user();
        $address = Address::where('id', $addressId)->firstOrFail();
        if ($address->user_id !== $currentUser->id) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'Không có quyền chỉnh sửa !');
        }
        $data = array_filter($req->validated(), fn($value) => $value !== null);
        $address->update($data);
    }
    public function setDefaultAddress($addressId)
    {
        $currentUser = auth()->user();
        $address = Address::where('id', $addressId)->firstOrFail();
        if ($address->user_id !== $currentUser->id) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'Không có quyền chỉnh sửa !');
        }
        Address::where('user_id', $currentUser->id)->update(['is_default' => false]);
        $address->is_default = true;
        $address->save();
    }
    public function deleteAddress($addressId)
    {
        $currentUser = auth()->user();
        $address = Address::where('id', $addressId)->firstOrFail();
        if ($address->user_id !== $currentUser->id) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'Không có quyền chỉnh sửa !');
        }
        $address->delete();
    }
    public function findAllAddressUser(?string $sort, int $page, int $size): PageResponse
    {
        $user = auth()->user();
        $query = $user->address();
        $column = 'id';
        $direction = 'asc';

        if ($sort && str_contains($sort, ':')) {
            [$partsColumn, $partsDirection] = explode(':', $sort);
            $column = $partsColumn;
            $direction = strtolower($partsDirection) === 'asc' ? 'asc' : 'desc';
        }

        $query->orderBy($column, $direction);
        $paginator = $query->paginate($size, ['*'], 'page', $page);
        return PageResponse::fromLaravelPaginator($paginator);
    }
}