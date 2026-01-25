<?php
namespace App\Http\Service;

use App\Enums\VoucherType;
use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Support\Carbon;
class VoucherService
{
    public function validateVoucherWithOrderAmount(Voucher $voucher, $orderAmount)
    {
        $now = Carbon::now();

        if ($orderAmount < $voucher->min_discount_value) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Đơn hàng không đủ điều kiện áp dụng voucher");
        }

        if ($now->lt($voucher->start_date) || $now->gt($voucher->end_date)) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Voucher đã hết hạn");
        }

        if ($voucher->remaining_quantity <= 0) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Voucher đã hết lượt sử dụng");
        }

        return true;
    }

    /**
     * Kiểm tra điều kiện sử dụng của User (Rank, Giới hạn sử dụng)
     */
    public function validateVoucherUsageUser(Voucher $voucher, ?User $user)
    {

        if (!$user) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Bạn cần đăng nhập để sử dụng voucher này");
        }

        if ($voucher->user_rank_id) {
            $voucherRank = $voucher->userRank;
            $userRank = $user->userRank;

            if (!$userRank) {
                throw new BusinessException(ErrorCode::BAD_REQUEST, "Bạn chưa có hạng thành viên để dùng voucher này");
            }

            if ($userRank->min_spent < $voucherRank->min_spent) {
                throw new BusinessException(
                    ErrorCode::BAD_REQUEST,
                    "Hạng '{$userRank->name}' không thể dùng voucher dành cho thành viên '{$voucherRank->name}'"
                );
            }
        }

        $usedCount = VoucherUsage::where('voucher_id', $voucher->id)
            ->where('user_id', $user->id)
            ->count();

        if ($usedCount >= $voucher->usage_limit_per_user) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Bạn đã sử dụng hết lượt cho phép của voucher này");
        }

        return true;
    }

    /**
     * Tính toán giá trị giảm giá
     */
    public function calculateDiscountValue($orderAmount, Voucher $voucher)
    {
        $discount = 0;

        if ($voucher->type === VoucherType::PERCENTAGE) {
            $percent = $voucher->discount_value / 100;
            $discount = $orderAmount * $percent;
        } else {
            $discount = $voucher->discount_value;
        }

        if ($voucher->max_discount_value !== null) {
            $discount = min($discount, $voucher->max_discount_value);
        }

        return $discount;
    }

    /**
     * Giảm số lượng voucher khi sử dụng thành công
     */
    public function decreaseVoucherQuantity(Voucher $voucher)
    {
        $voucher->increment('used_quantity', 1);
        $voucher->decrement('remaining_quantity', 1);
    }

    /**
     * Lấy danh sách Voucher khả dụng cho User
     */
    // public function getAvailableVouchersForUser(User $user)
    // {
    //     $now = Carbon::now();
    //     $userLevel = $user->userRank ? $user->userRank->level : 0;

    //     // Giả định bạn dùng Eloquent Scope hoặc Query Builder tương đương findAvailableForUser
    //     return Voucher::where('start_date', '<=', $now)
    //         ->where('end_date', '>=', $now)
    //         ->where('remaining_quantity', '>', 0)
    //         ->where(function($query) use ($userLevel) {
    //             $query->whereNull('user_rank_id')
    //                   ->orWhereHas('userRank', function($q) use ($userLevel) {
    //                       $q->where('level', '<=', $userLevel);
    //                   });
    //         })
    //         ->paginate(10);
    // }
}