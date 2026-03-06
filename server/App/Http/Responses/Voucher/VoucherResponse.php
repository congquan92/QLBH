<?php
namespace App\Http\Responses\Voucher;

use App\Http\Responses\UserRank\UserRankResponse;
use Illuminate\Support\Carbon;
class VoucherResponse
{
    public function __construct(
        public int $id,
        public string $type,
        public ?string $description,
        public string $status,
        public string $discountValue,
        public string $maxDiscountValue,
        public string $minDiscountValue,
        public int $totalQuantity,
        public bool $isShipping,
        public string $startDate,
        public string $endDate,
        public int $usageLimitPerUser,
        public string $used_quantity,
        public string $remaining_quantity,
        public ?UserRankResponse $userRankResponse
    ) {
    }
}