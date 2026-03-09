<?php

namespace Database\Seeders;

use App\Enums\CheckInStatus;
use App\Enums\DeliveryStatus;
use App\Enums\LeaveStatus;
use App\Enums\PaymentStatus;
use App\Enums\Status;
use App\Enums\VoucherStatus;
use App\Enums\VoucherType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FullDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $customer = DB::table('users')->where('username', 'customer_demo')->first();
            $admin = DB::table('users')->where('username', 'admin')->first();

            if (!$customer) {
                return;
            }

            $this->seedAttributesAndVariantMatrix();
            $this->seedAddressAndFavorites((int) $customer->id);
            $voucherId = $this->seedVoucherAndUsage((int) $customer->id);
            $this->seedReviewsForDeliveredOrder((int) $customer->id);
            $this->seedImportReceipts();
            $this->seedHrRecords((int) $customer->id, $admin?->id ? (int) $admin->id : null);

            if ($voucherId) {
                $this->attachVoucherToDeliveredOrder((int) $customer->id, $voucherId);
            }
        });
    }

    private function seedAttributesAndVariantMatrix(): void
    {
        $attributeNames = ['Color', 'Size'];

        foreach ($attributeNames as $attributeName) {
            DB::table('attributes')->updateOrInsert(
                ['name' => $attributeName],
                ['updated_at' => now(), 'created_at' => now()]
            );
        }

        $attributes = DB::table('attributes')->whereIn('name', $attributeNames)->get()->keyBy('name');

        $productMap = DB::table('products')
            ->whereIn('name', [
                'Ao Thun Basic Nam',
                'Ao So Mi Trang Cong So',
                'Giay Sneaker Trang',
                'Sandal Nu Mua He',
            ])
            ->get()
            ->keyBy('name');

        foreach ($productMap as $product) {
            foreach ($attributes as $attribute) {
                DB::table('product_attributes')->updateOrInsert(
                    ['product_id' => $product->id, 'attribute_id' => $attribute->id],
                    ['updated_at' => now(), 'created_at' => now()]
                );
            }
        }

        $productAttributes = DB::table('product_attributes')->get();
        $paIndex = [];
        foreach ($productAttributes as $row) {
            $paIndex[$row->product_id . '_' . $row->attribute_id] = $row->id;
        }

        $valueSpec = [
            'Ao Thun Basic Nam' => ['Color' => ['Black', 'White'], 'Size' => ['M', 'L']],
            'Ao So Mi Trang Cong So' => ['Color' => ['White'], 'Size' => ['M']],
            'Giay Sneaker Trang' => ['Color' => ['White'], 'Size' => ['41', '42']],
            'Sandal Nu Mua He' => ['Color' => ['Nude'], 'Size' => ['37']],
        ];

        foreach ($valueSpec as $productName => $groups) {
            if (!isset($productMap[$productName])) {
                continue;
            }
            $product = $productMap[$productName];

            foreach ($groups as $attributeName => $values) {
                if (!isset($attributes[$attributeName])) {
                    continue;
                }

                $paId = $paIndex[$product->id . '_' . $attributes[$attributeName]->id] ?? null;
                if (!$paId) {
                    continue;
                }

                foreach ($values as $value) {
                    DB::table('product_attribute_values')->updateOrInsert(
                        ['product_attribute_id' => $paId, 'value' => $value],
                        ['url_image' => null, 'updated_at' => now(), 'created_at' => now()]
                    );
                }
            }
        }

        $variantBindings = [
            'TS-BASIC-M-BLACK' => ['product' => 'Ao Thun Basic Nam', 'Color' => 'Black', 'Size' => 'M'],
            'TS-BASIC-L-WHITE' => ['product' => 'Ao Thun Basic Nam', 'Color' => 'White', 'Size' => 'L'],
            'SM-WHITE-M' => ['product' => 'Ao So Mi Trang Cong So', 'Color' => 'White', 'Size' => 'M'],
            'SN-WHITE-41' => ['product' => 'Giay Sneaker Trang', 'Color' => 'White', 'Size' => '41'],
            'SN-WHITE-42' => ['product' => 'Giay Sneaker Trang', 'Color' => 'White', 'Size' => '42'],
            'SD-NU-37' => ['product' => 'Sandal Nu Mua He', 'Color' => 'Nude', 'Size' => '37'],
        ];

        $variants = DB::table('product_variants')->whereIn('sku', array_keys($variantBindings))->get()->keyBy('sku');

        foreach ($variantBindings as $sku => $bind) {
            $variant = $variants[$sku] ?? null;
            $product = $productMap[$bind['product']] ?? null;
            if (!$variant || !$product) {
                continue;
            }

            foreach (['Color', 'Size'] as $attrName) {
                $attribute = $attributes[$attrName] ?? null;
                if (!$attribute) {
                    continue;
                }

                $paId = $paIndex[$product->id . '_' . $attribute->id] ?? null;
                if (!$paId) {
                    continue;
                }

                $valueId = DB::table('product_attribute_values')
                    ->where('product_attribute_id', $paId)
                    ->where('value', $bind[$attrName])
                    ->value('id');

                if (!$valueId) {
                    continue;
                }

                DB::table('product_variant_attribute_value')->updateOrInsert(
                    ['product_variant_id' => $variant->id, 'product_attribute_value_id' => $valueId],
                    ['updated_at' => now(), 'created_at' => now()]
                );
            }
        }
    }

    private function seedAddressAndFavorites(int $customerId): void
    {
        $addresses = [
            [
                'customer_name' => 'Customer Demo',
                'phone_number' => '0900000004',
                'address' => '123 Le Loi',
                'ward' => 'Ben Nghe',
                'district' => 'Quan 1',
                'province' => 'Ho Chi Minh',
                'province_id' => 79,
                'district_id' => 760,
                'ward_id' => 26734,
                'address_type' => 'HOME',
                'is_default' => true,
            ],
            [
                'customer_name' => 'Customer Demo',
                'phone_number' => '0900000004',
                'address' => '88 Nguyen Hue',
                'ward' => 'Ben Thanh',
                'district' => 'Quan 1',
                'province' => 'Ho Chi Minh',
                'province_id' => 79,
                'district_id' => 760,
                'ward_id' => 26740,
                'address_type' => 'WORK',
                'is_default' => false,
            ],
        ];

        foreach ($addresses as $address) {
            DB::table('addresses')->updateOrInsert(
                ['user_id' => $customerId, 'address' => $address['address']],
                array_merge($address, ['user_id' => $customerId, 'updated_at' => now(), 'created_at' => now()])
            );

            $addressId = DB::table('addresses')
                ->where('user_id', $customerId)
                ->where('address', $address['address'])
                ->value('id');

            if ($addressId) {
                DB::table('user_address')->updateOrInsert(
                    ['user_id' => $customerId, 'address_id' => $addressId],
                    ['is_default' => $address['is_default'], 'updated_at' => now(), 'created_at' => now()]
                );
            }
        }

        $favoriteProducts = DB::table('products')
            ->whereIn('name', ['Giay Sneaker Trang', 'Balo Laptop Chong Nuoc', 'Ao Thun Basic Nam'])
            ->pluck('id');

        foreach ($favoriteProducts as $productId) {
            DB::table('favorite_product')->updateOrInsert(
                ['user_id' => $customerId, 'product_id' => $productId],
                ['updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    private function seedVoucherAndUsage(int $customerId): ?int
    {
        $rankId = DB::table('user_ranks')->orderByDesc('min_spent')->value('id');
        if (!$rankId) {
            return null;
        }

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
                'used_quantity' => 0,
                'remaining_quantity' => 500,
                'start_date' => now()->subDays(7),
                'end_date' => now()->addMonths(3),
                'usage_limit_per_user' => 3,
                'user_rank_id' => $rankId,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $voucherId = DB::table('vouchers')->where('description', 'Demo voucher 10%')->value('id');
        $orderId = DB::table('orders')->where('order_tracking_code', 'DEMO-ORDER-1002')->value('id');

        if ($voucherId && $orderId) {
            DB::table('voucher_usages')->updateOrInsert(
                ['voucher_id' => $voucherId, 'order_id' => $orderId, 'user_id' => $customerId],
                ['usedAt' => now()->subDay(), 'updated_at' => now(), 'created_at' => now()]
            );
        }

        return $voucherId ? (int) $voucherId : null;
    }

    private function attachVoucherToDeliveredOrder(int $customerId, int $voucherId): void
    {
        $order = DB::table('orders')
            ->where('order_tracking_code', 'DEMO-ORDER-1002')
            ->where('user_id', $customerId)
            ->first();

        if (!$order) {
            return;
        }

        $discountValue = 50000;
        DB::table('orders')
            ->where('id', $order->id)
            ->update([
                'voucher_id' => $voucherId,
                'voucher_discount_value' => $discountValue,
                'voucher_snapshot' => json_encode([
                    'id' => $voucherId,
                    'description' => 'Demo voucher 10%',
                    'type' => VoucherType::PERCENTAGE->value,
                    'discount_value' => 10,
                ]),
                'total_amount' => max(0, (float) $order->total_amount - $discountValue),
                'payment_status' => PaymentStatus::PAID->value,
                'order_status' => DeliveryStatus::DELIVERED->value,
                'updated_at' => now(),
            ]);
    }

    private function seedReviewsForDeliveredOrder(int $customerId): void
    {
        $orderId = DB::table('orders')->where('order_tracking_code', 'DEMO-ORDER-1002')->value('id');
        if (!$orderId) {
            return;
        }

        $items = DB::table('order_items')->where('order_id', $orderId)->get();
        foreach ($items as $item) {
            DB::table('reviews')->updateOrInsert(
                ['order_item_id' => $item->id, 'user_id' => $customerId],
                [
                    'product_id' => $item->product_id,
                    'rating' => 4.5,
                    'comment' => 'San pham demo tot, dung nhu mo ta.',
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            $reviewId = DB::table('reviews')->where('order_item_id', $item->id)->where('user_id', $customerId)->value('id');
            if ($reviewId) {
                DB::table('image_reviews')->updateOrInsert(
                    ['review_id' => $reviewId, 'url_image' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80'],
                    ['updated_at' => now(), 'created_at' => now()]
                );
            }

            DB::table('order_items')->where('id', $item->id)->update([
                'is_reviewed' => true,
                'updated_at' => now(),
            ]);
        }
    }

    private function seedImportReceipts(): void
    {
        $variantRows = DB::table('product_variants')
            ->whereIn('sku', ['TS-BASIC-M-BLACK', 'SN-WHITE-41', 'BALO-15-BLACK'])
            ->get()
            ->keyBy('sku');

        $productRows = DB::table('products')
            ->whereIn('name', ['Ao Thun Basic Nam', 'Giay Sneaker Trang', 'Balo Laptop Chong Nuoc'])
            ->get()
            ->keyBy('name');

        $imports = [
            [
                'description' => 'Nhap demo Ao Thun Basic Nam',
                'product' => 'Ao Thun Basic Nam',
                'status' => DeliveryStatus::COMPLETED->value,
                'details' => [
                    ['sku' => 'TS-BASIC-M-BLACK', 'qty' => 20, 'unit' => 150000, 'attrs' => ['size' => 'M', 'color' => 'Black']],
                ],
            ],
            [
                'description' => 'Nhap demo Giay Sneaker Trang',
                'product' => 'Giay Sneaker Trang',
                'status' => DeliveryStatus::CONFIRMED->value,
                'details' => [
                    ['sku' => 'SN-WHITE-41', 'qty' => 10, 'unit' => 650000, 'attrs' => ['size' => '41', 'color' => 'White']],
                ],
            ],
            [
                'description' => 'Nhap demo Balo Laptop',
                'product' => 'Balo Laptop Chong Nuoc',
                'status' => DeliveryStatus::PENDING->value,
                'details' => [
                    ['sku' => 'BALO-15-BLACK', 'qty' => 12, 'unit' => 520000, 'attrs' => ['size' => '15.6 inch', 'color' => 'Black']],
                ],
            ],
        ];

        foreach ($imports as $import) {
            $product = $productRows[$import['product']] ?? null;
            if (!$product) {
                continue;
            }

            $totalAmount = 0;
            foreach ($import['details'] as $detail) {
                $totalAmount += $detail['qty'] * $detail['unit'];
            }

            DB::table('import_products')->updateOrInsert(
                ['description' => $import['description'], 'product_id' => $product->id],
                [
                    'totalAmount' => $totalAmount,
                    'status' => $import['status'],
                    'view_status' => Status::ACTIVE->value,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            $importProductId = DB::table('import_products')
                ->where('description', $import['description'])
                ->where('product_id', $product->id)
                ->value('id');

            if (!$importProductId) {
                continue;
            }

            foreach ($import['details'] as $detail) {
                $variant = $variantRows[$detail['sku']] ?? null;
                if (!$variant) {
                    continue;
                }

                DB::table('import_details')->updateOrInsert(
                    [
                        'import_product_id' => $importProductId,
                        'product_variant_id' => $variant->id,
                        'nameProductSnapShot' => $product->name,
                    ],
                    [
                        'quantity' => $detail['qty'],
                        'unitPrice' => $detail['unit'],
                        'urlImageSnapShot' => $product->url_image_cover,
                        'variantAttributesSnapshot' => json_encode($detail['attrs']),
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }
        }
    }

    private function seedHrRecords(int $customerId, ?int $adminId): void
    {
        $staffUsers = DB::table('users')
            ->whereIn('username', ['sale_ft_01', 'sale_pt_01', 'warehouse_01'])
            ->get();

        $shifts = DB::table('shifts')->whereIn('name', ['Ca Sang', 'Ca Chieu'])->get()->keyBy('name');

        // fallback when Vietnamese names exist in DB
        if ($shifts->isEmpty()) {
            $shifts = DB::table('shifts')->get()->keyBy('name');
        }

        $morningShift = $shifts->get('Ca Sang') ?? $shifts->first();
        $afternoonShift = $shifts->get('Ca Chieu') ?? $shifts->skip(1)->first() ?? $shifts->first();

        if (!$morningShift || !$afternoonShift) {
            return;
        }

        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();
        $tomorrow = now()->addDay()->toDateString();

        foreach ($staffUsers as $index => $user) {
            $shift = $index % 2 === 0 ? $morningShift : $afternoonShift;

            DB::table('shift_assignments')->updateOrInsert(
                ['user_id' => $user->id, 'shift_id' => $shift->id, 'date' => $today],
                ['updated_at' => now(), 'created_at' => now()]
            );

            DB::table('attendances')->updateOrInsert(
                ['user_id' => $user->id, 'date' => $yesterday],
                [
                    'check_in' => now()->subDay()->setTime(8, 5, 0),
                    'check_out' => now()->subDay()->setTime(17, 35, 0),
                    'is_holiday' => false,
                    'total_hours' => 8.5,
                    'status' => CheckInStatus::PRESENT->value,
                    'shift_id' => $shift->id,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            DB::table('leave_requests')->updateOrInsert(
                ['user_id' => $user->id, 'shift_id' => $shift->id, 'leave_date' => $tomorrow],
                [
                    'reason' => 'Demo leave request',
                    'status' => LeaveStatus::PENDING->value,
                    'approved_by' => $adminId,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        $positions = DB::table('positions')
            ->whereIn('name', ['Nhan vien Ban hang (Full-time)', 'Nhan vien Ban hang (Part-time)', 'Quan ly kho'])
            ->get();

        if ($positions->isEmpty()) {
            $positions = DB::table('positions')->get();
        }

        foreach ($positions as $position) {
            DB::table('position_default_schedules')->updateOrInsert(
                ['position_id' => $position->id, 'day_of_week' => 1, 'shift_id' => $morningShift->id],
                ['updated_at' => now(), 'created_at' => now()]
            );

            DB::table('position_default_schedules')->updateOrInsert(
                ['position_id' => $position->id, 'day_of_week' => 5, 'shift_id' => $afternoonShift->id],
                ['updated_at' => now(), 'created_at' => now()]
            );
        }

        // ensure customer has at least one attendance sample for user-side pages
        DB::table('attendances')->updateOrInsert(
            ['user_id' => $customerId, 'date' => $yesterday],
            [
                'check_in' => now()->subDay()->setTime(9, 0, 0),
                'check_out' => now()->subDay()->setTime(11, 0, 0),
                'is_holiday' => false,
                'total_hours' => 2,
                'status' => CheckInStatus::OT->value,
                'shift_id' => $morningShift->id,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }
}
