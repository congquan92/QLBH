<?php

namespace App\Http\Service\Auth;

use App\Enums\OTPType;
use App\Enums\Rank;
use App\Enums\RoleType;
use App\Enums\UserStatus;
use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use App\Exceptions\MessageError;
use App\Http\Mapper\RoleMapper;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\IntrospectRequest;

use App\Http\Responses\Auth\AuthenticationResponse;
use App\Http\Service\BrevoService;
use App\Jobs\SendOtpJob;
use App\Models\Role;
use App\Models\UserRank;
use Carbon\Carbon;
use DB;
use Exception;
use Hash;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Redis;
use Tymon\JWTAuth\JWTGuard;
use App\Models\User;

class AuthService
{
    protected $brevoService;

    public function __construct(BrevoService $brevoService)
    {
        $this->brevoService = $brevoService;
    }
    /**
     * @param array $credentials
     * @return string
     */

    public function login(LoginRequest $request): AuthenticationResponse
    {
        /** @var JWTGuard $guard */
        $guard = auth('api');


        $user = User::where('username', $request->username())->first();
        if(!$user){
            throw new Exception("huyasc");
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw new BusinessException(
                ErrorCode::UNAUTHENTICATED
                ,
                "Tài khoản không tồn tại hoặc mật khẩu không đúng"
            );
        }

        if ($user->status == UserStatus::NONE) {
            throw new BusinessException(
                ErrorCode::UNAUTHENTICATED
                ,
                "Tài khoản chưa được xác thực"
            );
        }

        if ($user->status == UserStatus::INACTIVE) {
            throw new BusinessException(
                ErrorCode::UNAUTHENTICATED
                ,
                "Tài khoản đã bị khoá"
            );
        }

        $token = $guard->login($user);
        $ttl = (int) config('jwt.ttl');

        return new AuthenticationResponse(
            token: $token,
            authenticated: true,
            role: RoleMapper::toRoleResponse($user->role),
            expiredAt: Carbon::now()->addMinutes($ttl)
        );
    }

    /**
     * Logout user và invalidate token
     */
    public function logout()
    {
        $user = auth()->user();
        $user->increment('token_version');

        return response()->json([
            'message' => 'Logged out'
        ]);
    }

    /**
     * Đăng kí người dùng
     */
    public function register(RegisterRequest $request): string
    {

        return DB::transaction(function () use ($request) {
            if (User::where('username', $request['username'])->exists()) {
                throw new BusinessException(
                    ErrorCode::EXISTED,
                    MessageError::USERNAME_EXISTED
                );
            }
            $userRank = UserRank::where('name', Rank::BRONZE->value)->firstOrFail();
            $role = Role::where('name', RoleType::USER->value)->firstOrFail();
            $user = User::create([
                'username' => $request['username'],
                'email' => $request['email'],
                'password' => bcrypt($request['password']),
                'full_name' => $request['fullName'],
                'phone' => $request['phone'],
                'gender' => $request['gender'],
                'date_of_birth' => $request['dateOfBirth'],
                'status' => UserStatus::NONE,
                'user_rank_id' => $userRank->id,
                'role_id' => $role->id
            ]);

            $this->brevoService->sendTransacNotifications($user, OTPType::VERIFICATION, true);
            return "Đăng ký thành công, OTP đã được gửi!";
        });
    }

    /**
     * Refresh token
     */
    public function refresh(): string
    {
        /** @var JWTGuard $guard */
        $guard = auth('api');
        return $guard->refresh();
    }

    /**
     * Lấy thông tin user hiện tại
     */
    public function introspect(): array
    {
        /** @var JWTGuard $guard */
        $guard = auth('api');
        $user = $guard->user();

        return [
            "valid" => true,
            "id" => $user->id,
            "email" => $user->email,
            "roles" => $user->role ? [$user->role->name] : []
        ];
    }
}
