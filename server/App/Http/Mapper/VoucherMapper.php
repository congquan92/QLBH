<?php
namespace App\Http\Mapper;

use App\Enums\Status;
use App\Http\Responses\Voucher\VoucherResponse;
use App\Models\User;
use App\Models\Voucher;
class VoucherMapper
{
    public static function toVoucherResponse(Voucher $voucher, ?User $currentUser = null): VoucherResponse
    {
        $userRankResponse = (($voucher->userRank && $voucher->userRank->status === Status::ACTIVE)
            ? UserRankMapper::toUserRankResponse($voucher->userRank)
            : null);

        $currentUserUsedCount = (int) ($voucher->current_user_used_count ?? 0);
        $usageLimit = (int) ($voucher->usage_limit_per_user ?? 0);
        $canUse = $voucher->remaining_quantity > 0
            && ($usageLimit <= 0 || $currentUserUsedCount < $usageLimit);

        return new VoucherResponse(
            $voucher->id,
            $voucher->type->value,
            $voucher->description,
            $voucher->status->value,
            $voucher->discount_value,
            $voucher->max_discount_value,
            $voucher->min_discount_value,
            $voucher->total_quantity,
            $voucher->is_shipping,
            $voucher->start_date,
            $voucher->end_date,
            $voucher->usage_limit_per_user,
            $voucher->used_quantity,
            $voucher->remaining_quantity,
            $userRankResponse,
            $currentUserUsedCount,
            $canUse
        );
    }
}
