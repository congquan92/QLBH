<?php
namespace App\Http\Service;
use App\Http\Responses\Auth\AuthenticationResponse;
use App\Models\User;
use App\Models\Role;
use App\Models\UserRank;
use App\Enums\UserStatus;
use App\Enums\Gender;
use App\Enums\Rank;
use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Tymon\JWTAuth\Facades\JWTAuth;
class OAuthService
{
    public function loginWithGoogle(string $accessToken)
    {
        try {
            /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
            $driver = Socialite::driver('google');
            $googleUser = $driver->userFromToken($accessToken);
            $rawData = $googleUser->getRaw();
            $email = $googleUser->getEmail();
            $fullName = $googleUser->getName();
            $picture = $googleUser->getAvatar();
            $googleId = $googleUser->getId();
            $birthday = $this->extractBirthday($rawData);
            $gender = $this->extractGender($rawData);
            $user = $this->findOrCreateUser($email, $fullName, $picture, $googleId, $birthday, $gender);

            if ($user->status === UserStatus::INACTIVE) {
                throw new BusinessException(ErrorCode::BAD_REQUEST, "User is not active");
            }
            $token = JWTAuth::fromUser($user);
            $ttl = (int) config('jwt.ttl');
            return new AuthenticationResponse(
                token: $token,
                authenticated: true,
                role: $user->role->name ?? 'USER',
                expiredAt: Carbon::now()->addMinutes($ttl)
            );

        } catch (\Exception $e) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Google authentication failed: " . $e->getMessage());
        }
    }
    private function extractBirthday(array $rawData): ?string
    {
        if (isset($rawData['birthdays'][0]['date'])) {
            $date = $rawData['birthdays'][0]['date'];
            $year = $date['year'] ?? null;
            $month = $date['month'] ?? null;
            $day = $date['day'] ?? null;

            if ($year && $month && $day) {
                return Carbon::createFromDate($year, $month, $day)->format('Y-m-d');
            }
        }
        return null;
    }

    private function extractGender(array $rawData): Gender
    {
        if (isset($rawData['genders'][0]['value'])) {
            $genderStr = strtoupper($rawData['genders'][0]['value']);
            // Map string từ Google sang Enum của bạn
            return match ($genderStr) {
                'MALE' => Gender::MALE,
                'FEMALE' => Gender::FEMALE,
                default => Gender::OTHER,
            };
        }
        return Gender::OTHER;
    }

    private function findOrCreateUser($email, $fullName, $picture, $googleId, $birthday, $gender)
    {
        $user = User::where('provider', 'google')
            ->where('provider_id', $googleId)
            ->first();

        if ($user) {
            return $user;
        }

        $role = Role::where('name', 'USER')->first();
        $userRank = UserRank::where('name', Rank::BRONZE->value)->first();

        return User::create([
            'email' => $email,
            'full_name' => $fullName,
            'avatar' => $picture,
            'date_of_birth' => $birthday, // Lưu ngày sinh
            'gender' => $gender,           // Lưu giới tính
            'status' => UserStatus::ACTIVE,
            'provider' => 'google',
            'provider_id' => $googleId,
            'role_id' => $role->id,
            'user_rank_id' => $userRank->id,
            'total_spent' => 0,
            'email_verified' => true,
            'password' => Hash::make(Str::random(24)),
        ]);
    }
}