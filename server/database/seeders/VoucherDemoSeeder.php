<?php

namespace Database\Seeders;

use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Enums\VoucherStatus;
use App\Enums\VoucherType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VoucherDemoSeeder extends Seeder
{
    public function run(): void
    {
        $customerId = DB::table('users')->where('username', 'customer_demo')->value('id');
        $rankId = DB::table('user_ranks')->orderByDesc('min_spent')->value('id');
        $order = DB::table('orders')->where('order_tracking_code', 'DEMO-ORDER-1002')->first();

        if (!$customerId || !$rankId || !$order) {
            return;
        }

        DB::transaction(function () use ($customerId, $rankId, $order): void {
            DB::table('vouchers')->updateOrInsert(
                ['description' => 'Demo voucher 10%'],
                [
                    'type' => VoucherType::PERCENTAGE->value,
                    'discount_value' => 10,
                    'max_discount_value' => 100000,
                    'min_discount_value' => 200000,
                    'total_quantity' => 500,
                    'is_shipping' => false,
                    'status' => VoucherStatus::ACTIVE->value,
                    'used_quantity' => 1,
                    'remaining_quantity' => 499,
                    'start_date' => now()->subDays(7),
                    'end_date' => now()->addMonths(3),
                    'usage_limit_per_user' => 3,
                    'user_rank_id' => $rankId,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            $voucherId = DB::table('vouchers')->where('description', 'Demo voucher 10%')->value('id');
            if (!$voucherId) {
                return;
            }

            DB::table('voucher_usages')->updateOrInsert(
                ['voucher_id' => $voucherId, 'order_id' => $order->id, 'user_id' => $customerId],
                ['usedAt' => now()->subDay(), 'updated_at' => now(), 'created_at' => now()]
            );

            $discount = 50000;
            DB::table('orders')->where('id', $order->id)->update([
                'voucher_id' => $voucherId,
                'voucher_discount_value' => $discount,
                'voucher_snapshot' => json_encode(['id' => $voucherId, 'description' => 'Demo voucher 10%', 'type' => VoucherType::PERCENTAGE->value, 'discount_value' => 10]),
                'total_amount' => max(0, (float) $order->total_amount - $discount),
                'payment_status' => PaymentStatus::PAID->value,
                'order_status' => DeliveryStatus::DELIVERED->value,
                'updated_at' => now(),
            ]);
        });
    }
}