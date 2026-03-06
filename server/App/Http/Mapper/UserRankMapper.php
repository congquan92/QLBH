<?php
namespace App\Http\Mapper;

use App\Http\Responses\UserRank\UserRankResponse;
use App\Models\UserRank;


class UserRankMapper
{
    public static function toUserRankResponse(UserRank $userRank): UserRankResponse
    {

        return new UserRankResponse(
            $userRank->id,
            $userRank->name,
            $userRank->min_spent,
            $userRank->status->value
        );
    }
}