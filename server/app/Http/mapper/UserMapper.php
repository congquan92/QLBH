<?php
namespace App\Http\Mapper;

use App\Http\Responses\Address\AddressResponse;
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
                $address->isDefault,
            );
        })->toArray();
        return new UserResponse(
            $user->id,
            $user->username,
            $user->full_name,
            $user->gender,
            $user->date_of_birth,
            $user->email,
            $user->phone,
            $user->avatar,
            $user->status,
            $user->point,
            $user->email_verified,
            $user->phone_verified,
            $user->total_spent,
            $user->addresses,
            UserRankMapper::toUserRankResponse($user->userRank),
            RoleMapper::toRoleResponse($user->role),
        );
    }
}