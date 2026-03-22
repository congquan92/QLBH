<?php
namespace App\Http\Mapper;

use App\Enums\Status;
use App\Http\Responses\Address\AddressResponse;
use App\Http\Responses\Position\PositionResponse;
use App\Http\Responses\User\UserResponse;
use App\Models\User;


class UserMapper
{
    public static function toUserResponse(User $user): UserResponse
    {
        $addresses = $user->address->map(function ($address) {
            return new AddressResponse(
                $address->id,
                $address->address,
                $address->customer_name,
                $address->phone_number,
                $address->province,
                $address->district,
                $address->ward,
                $address->province_id,
                $address->district_id,
                $address->ward_id,
                $address->address_type,
                $address->is_default,
            );
        })->toArray();

        // Employment type từ job history hiện tại
        $employmentType = $user->employmentType?->value ?? ($user->employmentType instanceof \BackedEnum ? $user->employmentType->value : $user->employmentType);

        // Position response
        $positionResponse = null;
        if ($user->position) {
            $positionResponse = new PositionResponse(
                $user->position->id,
                $user->position->name,
                $user->position->base_salary,
                $user->position->salary_type?->value ?? $user->position->salary_type,
            );
        }

        return new UserResponse(
            $user->id,
            $user->username,
            $user->full_name,
            $user->gender->value,
            $user->date_of_birth,
            $user->email,
            $user->phone,
            $user->avatar,
            $user->status->value,
            $user->point,
            $user->email_verified,
            $user->phone_verified,
            $user->total_spent,
            $addresses,
            (
                ($user->userRank && $user->userRank->status === Status::ACTIVE)
                ? UserRankMapper::toUserRankResponse($user->userRank)
                : null
            ),
            (
                ($user->role && $user->role->status === Status::ACTIVE)
                ? RoleMapper::toRoleResponse($user->role)
                : null
            ),
            $employmentType,
            $positionResponse,
        );
    }
}