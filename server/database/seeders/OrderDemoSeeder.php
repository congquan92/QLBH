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

        $deliveryAddress = $this->resolveDeliveryAddress((int) $customer->id);
        if (!$deliveryAddress) {
            return;
        }

        DB::transaction(function () use ($customer, $deliveryAddress): void {
            $this->seedOrders(
                (int) $customer->id,
                (string) ($customer->full_name ?? 'Customer Demo'),
                (string) ($customer->phone ?? '0900000004'),
                $deliveryAddress
            );
            $this->syncCustomerSpent((int) $customer->id);
            $this->syncProductSoldQuantity();
        });
    }

    private function seedOrders(int $userId, string $customerName, string $customerPhone, array $deliveryAddress): void
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
                    'delivery_ward_name' => $deliveryAddress['ward'],
                    'delivery_ward_code' => $deliveryAddress['ward_id'],
                    'delivery_district_id' => $deliveryAddress['district_id'],
                    'delivery_province_id' => $deliveryAddress['province_id'],
                    'delivery_district_name' => $deliveryAddress['district'],
                    'delivery_province_name' => $deliveryAddress['province'],
                    'delivery_address' => $deliveryAddress['address'],
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

    private function resolveDeliveryAddress(int $userId): ?array
    {
        $defaultAddress = DB::table('user_address')
            ->join('addresses', 'addresses.id', '=', 'user_address.address_id')
            ->where('user_address.user_id', $userId)
            ->where('user_address.is_default', true)
            ->select('addresses.*')
            ->first();

        $address = $defaultAddress ?: DB::table('addresses')
            ->where('user_id', $userId)
            ->orderBy('id')
            ->first();

        if (!$address) {
            return null;
        }

        return [
            'ward' => (string) $address->ward,
            'ward_id' => (string) $address->ward_id,
            'district_id' => (int) $address->district_id,
            'province_id' => (int) $address->province_id,
            'district' => (string) $address->district,
            'province' => (string) $address->province,
            'address' => (string) $address->address,
        ];
    }

    private function syncCustomerSpent(int $userId): void
    {
        $totalSpent = (float) DB::table('orders')
            ->where('user_id', $userId)
            ->where('payment_status', PaymentStatus::PAID->value)
            ->sum('total_amount');

        DB::table('users')
            ->where('id', $userId)
            ->update(['total_spent' => $totalSpent, 'updated_at' => now()]);
    }

    private function syncProductSoldQuantity(): void
    {
        $soldRows = DB::table('order_items')
            ->select('product_id', DB::raw('SUM(quantity) as sold_quantity'))
            ->groupBy('product_id')
            ->get();

        foreach ($soldRows as $row) {
            DB::table('products')
                ->where('id', $row->product_id)
                ->update(['sold_quantity' => (int) $row->sold_quantity, 'updated_at' => now()]);
        }
    }
}
