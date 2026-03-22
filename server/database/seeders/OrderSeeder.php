<?php

namespace Database\Seeders;

use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * OrderSeeder — đơn hàng thực tế từ 3 khách, nhiều sản phẩm, các trạng thái khác nhau.
 */
class OrderSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->seedOrders();
            $this->syncProductSoldQuantity();
            $this->syncCustomerSpent();
        });
    }

    private function seedOrders(): void
    {
        $orders = [
            // ── Khách 1: Phạm Thị Thu ──────────────────────────────────────
            [
                'tracking_code'  => 'ORD-2026-0001',
                'username'       => 'khach_01',
                'payment_type'   => PaymentType::COD->value,
                'payment_status' => PaymentStatus::UNPAID->value,
                'order_status'   => DeliveryStatus::CONFIRMED->value,
                'is_confirmed'   => true,
                'note'           => 'Giao giờ hành chính, gọi trước khi giao.',
                'items' => [
                    ['sku' => 'ATN-BAS-DEN-M',  'qty' => 2],
                    ['sku' => 'DEP-QN-DEN-40',  'qty' => 1],
                ],
            ],
            [
                'tracking_code'  => 'ORD-2026-0002',
                'username'       => 'khach_01',
                'payment_type'   => PaymentType::BANK_TRANSFER->value,
                'payment_status' => PaymentStatus::PAID->value,
                'order_status'   => DeliveryStatus::DELIVERED->value,
                'is_confirmed'   => true,
                'note'           => null,
                'items' => [
                    ['sku' => 'APO-PIQ-NAV-L',  'qty' => 1],
                ],
            ],
            // ── Khách 2: Nguyễn Văn Bình ───────────────────────────────────
            [
                'tracking_code'  => 'ORD-2026-0003',
                'username'       => 'khach_02',
                'payment_type'   => PaymentType::COD->value,
                'payment_status' => PaymentStatus::PAID->value,
                'order_status'   => DeliveryStatus::DELIVERED->value,
                'is_confirmed'   => true,
                'note'           => null,
                'items' => [
                    ['sku' => 'QJN-SLM-XAD-30', 'qty' => 1],
                    ['sku' => 'ATN-BAS-TRG-M',   'qty' => 3],
                ],
            ],
            [
                'tracking_code'  => 'ORD-2026-0004',
                'username'       => 'khach_02',
                'payment_type'   => PaymentType::BANK_TRANSFER->value,
                'payment_status' => PaymentStatus::UNPAID->value,
                'order_status'   => DeliveryStatus::PENDING->value,
                'is_confirmed'   => false,
                'note'           => 'Đơn mới chưa xác nhận.',
                'items' => [
                    ['sku' => 'AKO-BOM-DEN-L',   'qty' => 1],
                ],
            ],
            // ── Khách 3: Hoàng Thị Lan ─────────────────────────────────────
            [
                'tracking_code'  => 'ORD-2026-0005',
                'username'       => 'khach_03',
                'payment_type'   => PaymentType::COD->value,
                'payment_status' => PaymentStatus::PAID->value,
                'order_status'   => DeliveryStatus::DELIVERED->value,
                'is_confirmed'   => true,
                'note'           => null,
                'items' => [
                    ['sku' => 'DEP-QN-DEN-41',   'qty' => 1],
                    ['sku' => 'DEP-QN-NHU-41',   'qty' => 1],
                ],
            ],
        ];

        $variants = DB::table('product_variants')->get()->keyBy('sku');
        $products = DB::table('products')->get()->keyBy('id');

        foreach ($orders as $order) {
            $userId = DB::table('users')->where('username', $order['username'])->value('id');
            if (!$userId) continue;

            $defaultAddr = DB::table('user_address')
                ->join('addresses', 'addresses.id', '=', 'user_address.address_id')
                ->where('user_address.user_id', $userId)
                ->where('user_address.is_default', true)
                ->select('addresses.*')
                ->first()
                ?: DB::table('addresses')->where('user_id', $userId)->orderBy('id')->first();

            if (!$defaultAddr) continue;

            $user     = DB::table('users')->find($userId);
            $amount   = 0;
            $weight   = 0;
            $length   = 0;
            $width    = 0;
            $height   = 0;

            foreach ($order['items'] as $item) {
                $variant = $variants[$item['sku']] ?? null;
                if (!$variant) continue;
                $amount += (float) $variant->price * (int) $item['qty'];
                $weight += (int) $variant->weight  * (int) $item['qty'];
                $length  = max($length, (int) $variant->length);
                $width   = max($width,  (int) $variant->width);
                $height += (int) $variant->height;
            }

            DB::table('orders')->updateOrInsert(
                ['order_tracking_code' => $order['tracking_code']],
                [
                    'customer_name'           => $user->full_name,
                    'customer_phone'          => $user->phone,
                    'delivery_address'        => $defaultAddr->address,
                    'delivery_ward_name'      => $defaultAddr->ward,
                    'delivery_ward_code'      => (string) $defaultAddr->ward_id,
                    'delivery_district_id'    => (int) $defaultAddr->district_id,
                    'delivery_province_id'    => (int) $defaultAddr->province_id,
                    'delivery_district_name'  => $defaultAddr->district,
                    'delivery_province_name'  => $defaultAddr->province,
                    'service_type_id'         => 2,
                    'original_order_amount'   => $amount,
                    'total_fee_for_ship'      => 0,
                    'total_amount'            => $amount,
                    'weight'                  => max(1, $weight),
                    'length'                  => max(1, $length),
                    'width'                   => max(1, $width),
                    'height'                  => max(1, $height),
                    'note'                    => $order['note'],
                    'order_status'            => $order['order_status'],
                    'payment_type'            => $order['payment_type'],
                    'payment_status'          => $order['payment_status'],
                    'payment_at'              => $order['payment_status'] === PaymentStatus::PAID->value ? now()->subDays(rand(1, 10)) : null,
                    'delivered_at'            => $order['order_status'] === DeliveryStatus::DELIVERED->value ? now()->subDays(rand(1, 5)) : null,
                    'completed_at'            => null,
                    'voucher_discount_value'  => 0,
                    'user_id'                 => $userId,
                    'is_confirmed'            => $order['is_confirmed'],
                    'updated_at'              => now(),
                    'created_at'              => now()->subDays(rand(10, 30)),
                ]
            );

            $orderId = DB::table('orders')->where('order_tracking_code', $order['tracking_code'])->value('id');
            if (!$orderId) continue;

            foreach ($order['items'] as $item) {
                $variant = $variants[$item['sku']] ?? null;
                if (!$variant) continue;

                $product = $products[$variant->product_id] ?? null;
                if (!$product) continue;

                DB::table('order_items')->updateOrInsert(
                    ['order_id' => $orderId, 'product_variant_id' => $variant->id],
                    [
                        'product_id'                  => $product->id,
                        'quantity'                    => $item['qty'],
                        'is_reviewed'                 => false,
                        'final_price'                 => (float) $variant->price * (int) $item['qty'],
                        'list_price_snapShot'         => $product->list_price,
                        'name_product_snapshot'       => $product->name,
                        'url_image_snapShot'          => $product->url_image_cover,
                        'variant_attributes_snapshot' => $this->buildVariantAttrSnapshot((int) $variant->id),
                        'updated_at'                  => now(),
                        'created_at'                  => now(),
                    ]
                );
            }
        }
    }

    /**
     * Query attribute của variant từ DB và trả về JSON snapshot dạng:
     * {"Màu sắc": "Đen", "Kích thước": "M"}
     */
    private function buildVariantAttrSnapshot(int $variantId): string
    {
        $rows = DB::table('product_variant_attribute_value as pvav')
            ->join('product_attribute_values as pav', 'pav.id', '=', 'pvav.product_attribute_value_id')
            ->join('product_attributes as pa', 'pa.id', '=', 'pav.product_attribute_id')
            ->join('attributes as a', 'a.id', '=', 'pa.attribute_id')
            ->where('pvav.product_variant_id', $variantId)
            ->select('a.name as attr_name', 'pav.value as attr_value')
            ->get();

        if ($rows->isEmpty()) {
            return '{}';
        }

        $map = [];
        foreach ($rows as $row) {
            $map[$row->attr_name] = $row->attr_value;
        }

        return json_encode($map, JSON_UNESCAPED_UNICODE);
    }

    private function syncProductSoldQuantity(): void
    {
        $rows = DB::table('order_items')
            ->select('product_id', DB::raw('SUM(quantity) as sold'))
            ->groupBy('product_id')
            ->get();

        foreach ($rows as $row) {
            DB::table('products')->where('id', $row->product_id)
                ->update(['sold_quantity' => (int) $row->sold, 'updated_at' => now()]);
        }
    }

    private function syncCustomerSpent(): void
    {
        $rows = DB::table('orders')
            ->where('payment_status', PaymentStatus::PAID->value)
            ->select('user_id', DB::raw('SUM(total_amount) as spent'))
            ->groupBy('user_id')
            ->get();

        foreach ($rows as $row) {
            DB::table('users')->where('id', $row->user_id)
                ->update(['total_spent' => (float) $row->spent, 'updated_at' => now()]);
        }
    }
}
