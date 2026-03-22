<?php

namespace Database\Seeders;

use App\Enums\VoucherStatus;
use App\Enums\VoucherType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VoucherSeeder extends Seeder
{
    public function run(): void
    {
        $defaultRankId = DB::table('user_ranks')->orderBy('min_spent')->value('id');
        $highestRankId = DB::table('user_ranks')->orderByDesc('min_spent')->value('id');

        $vouchers = [
            [
                'description'          => 'Giảm 10% cho đơn từ 300.000đ - Hội viên',
                'type'                 => VoucherType::PERCENTAGE->value,
                'discount_value'       => 10,
                'max_discount_value'   => 100_000,
                'min_discount_value'   => 300_000,
                'total_quantity'       => 500,
                'is_shipping'          => false,
                'status'               => VoucherStatus::ACTIVE->value,
                'used_quantity'        => 0,
                'remaining_quantity'   => 500,
                'start_date'           => now()->startOfMonth(),
                'end_date'             => now()->addMonths(2)->endOfMonth(),
                'usage_limit_per_user' => 1,
                'user_rank_id'         => $defaultRankId,
            ],
            [
                'description'          => 'Giảm 50.000đ vận chuyển - Khách VIP',
                'type'                 => VoucherType::FIXED_AMOUNT->value,
                'discount_value'       => 50_000,
                'max_discount_value'   => 50_000,
                'min_discount_value'   => 500_000,
                'total_quantity'       => 200,
                'is_shipping'          => true,
                'status'               => VoucherStatus::ACTIVE->value,
                'used_quantity'        => 0,
                'remaining_quantity'   => 200,
                'start_date'           => now()->startOfMonth(),
                'end_date'             => now()->addMonth()->endOfMonth(),
                'usage_limit_per_user' => 2,
                'user_rank_id'         => $highestRankId,
            ],
            [
                'description'          => 'Voucher Mừng Lễ 30/4 - Giảm 15%',
                'type'                 => VoucherType::PERCENTAGE->value,
                'discount_value'       => 15,
                'max_discount_value'   => 150_000,
                'min_discount_value'   => 400_000,
                'total_quantity'       => 300,
                'is_shipping'          => false,
                'status'               => VoucherStatus::ACTIVE->value,
                'used_quantity'        => 0,
                'remaining_quantity'   => 300,
                'start_date'           => \Carbon\Carbon::create(now()->year, 4, 28)->startOfDay(),
                'end_date'             => \Carbon\Carbon::create(now()->year, 5, 2)->endOfDay(),
                'usage_limit_per_user' => 1,
                'user_rank_id'         => $defaultRankId,
            ],
        ];

        foreach ($vouchers as $v) {
            DB::table('vouchers')->updateOrInsert(
                ['description' => $v['description']],
                array_merge($v, ['updated_at' => now(), 'created_at' => now()])
            );
        }
    }
}
