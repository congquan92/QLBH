<?php
namespace App\Http\Mapper;

use App\Http\Responses\Voucher\VoucherResponse;
use App\Models\Voucher;
class VoucherMapper{
    public static function toVoucherResponse(Voucher $voucher):VoucherResponse{
        $userRankResponse = UserRankMapper::toUserRankResponse($voucher->userRank);
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
            $userRankResponse
        );
    }
}
