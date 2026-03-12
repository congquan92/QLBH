<?php

namespace Database\Seeders;

use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderDemoSeeder extends Seeder
{
    private const PRODUCT_NAME = 'Dép Nam ICONDENIM Drift Slides';

    public function run(): void
    {
        $customer = DB::table('users')->where('username', 'customer_demo')->first();
        if (!$customer) {
            return;
        }

        DB::transaction(function () use ($customer): void {
            $this->seedOrders((int) $customer->id, (string) ($customer->full_name ?? 'Customer Demo'), (string) ($customer->phone ?? '0900000004'));
        });
    }

    private function seedOrders(int $userId, string $customerName, string $customerPhone): void
    {
        $variants = DB::table('product_variants')->whereIn('sku', ['DRIFT-BLK-M', 'DRIFT-GBE-L'])->get()->keyBy('sku');
        $products = DB::table('products')->whereIn('name', [self::PRODUCT_NAME])->get()->keyBy('name');

        $samples = [
            ['tracking_code' => 'DEMO-ORDER-1001', 'status' => DeliveryStatus::CONFIRMED->value, 'payment_type' => PaymentType::COD->value, 'payment_status' => PaymentStatus::UNPAID->value, 'is_confirmed' => true, 'items' => [['sku' => 'DRIFT-BLK-M', 'product' => self::PRODUCT_NAME, 'qty' => 1, 'attrs' => ['Kích thước' => 'M', 'Màu sắc' => 'Đen']]]],
            ['tracking_code' => 'DEMO-ORDER-1002', 'status' => DeliveryStatus::DELIVERED->value, 'payment_type' => PaymentType::BANK_TRANSFER->value, 'payment_status' => PaymentStatus::PAID->value, 'is_confirmed' => true, 'items' => [['sku' => 'DRIFT-GBE-L', 'product' => self::PRODUCT_NAME, 'qty' => 2, 'attrs' => ['Kích thước' => 'L', 'Màu sắc' => 'Xám be']]]],
        ];

        foreach ($samples as $sample) {
            $amount = 0;
            $weight = 0;
            $length = 0;
            $width = 0;
            $height = 0;

            foreach ($sample['items'] as $item) {
                $variant = $variants[$item['sku']] ?? null;
                if (!$variant) {
                    continue;
                }
                $qty = (int) $item['qty'];
                $amount += (float) $variant->price * $qty;
                $weight += (int) $variant->weight * $qty;
                $length = max($length, (int) $variant->length);
                $width = max($width, (int) $variant->width);
                $height += (int) $variant->height;
            }

            $shipping = 30000;
            DB::table('orders')->updateOrInsert(
                ['order_tracking_code' => $sample['tracking_code']],
                [
                    'customer_name' => $customerName,
                    'customer_phone' => $customerPhone,
                    'delivery_ward_name' => 'Phường Bình Hưng Hoà A',
                    'delivery_ward_code' => '21904',
                    'delivery_district_id' => 1458,
                    'delivery_province_id' => 209,
                    'delivery_district_name' => 'Quận Bình Tân',
                    'delivery_province_name' => 'Hồ Chí Minh',
                    'delivery_address' => 'abcd, Quận Bình Tân',
                    'service_type_id' => 2,
                    'original_order_amount' => $amount,
                    'weight' => max(1, $weight),
                    'length' => max(1, $length),
                    'width' => max(1, $width),
                    'height' => max(1, $height),
                    'total_fee_for_ship' => $shipping,
                    'note' => 'Đơn hàng demo theo dữ liệu seed mới',
                    'total_amount' => $amount + $shipping,
                    'order_status' => $sample['status'],
                    'payment_type' => $sample['payment_type'],
                    'payment_status' => $sample['payment_status'],
                    'payment_at' => $sample['payment_status'] === PaymentStatus::PAID->value ? now()->subDay() : null,
                    'delivered_at' => $sample['status'] === DeliveryStatus::DELIVERED->value ? now()->subDay() : null,
                    'completed_at' => null,
                    'voucher_discount_value' => 0,
                    'user_id' => $userId,
                    'is_confirmed' => $sample['is_confirmed'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            $orderId = DB::table('orders')->where('order_tracking_code', $sample['tracking_code'])->value('id');
            if (!$orderId) {
                continue;
            }

            foreach ($sample['items'] as $item) {
                $variant = $variants[$item['sku']] ?? null;
                $product = $products[$item['product']] ?? null;
                if (!$variant || !$product) {
                    continue;
                }

                DB::table('order_items')->updateOrInsert(
                    ['order_id' => $orderId, 'product_variant_id' => $variant->id],
                    [
                        'product_id' => $product->id,
                        'quantity' => $item['qty'],
                        'is_reviewed' => false,
                        'final_price' => (float) $variant->price * (int) $item['qty'],
                        'list_price_snapShot' => $product->list_price,
                        'name_product_snapshot' => $product->name,
                        'url_image_snapShot' => $product->url_image_cover,
                        'variant_attributes_snapshot' => json_encode($item['attrs']),
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }
        }
    }
}