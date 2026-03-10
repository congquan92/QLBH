<?php

namespace Database\Seeders;

use App\Enums\Status;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CustomerDemoSeeder extends Seeder
{
    private const PRODUCT_NAME = 'Dép Nam ICONDENIM Drift Slides';

    public function run(): void
    {
        $customerId = DB::table('users')->where('username', 'customer_demo')->value('id');
        if (!$customerId) {
            return;
        }

        DB::transaction(function () use ($customerId): void {
            $this->seedAddresses((int) $customerId);
            $this->seedFavorites((int) $customerId);
            $this->seedCarts((int) $customerId);
        });
    }

    private function seedAddresses(int $customerId): void
    {
        $samples = [
            ['customer_name' => 'ABCD', 'phone_number' => '0399097211', 'address' => 'abcd', 'ward' => 'Phường Bình Hưng Hoà A', 'district' => 'Quận Bình Tân', 'province' => 'Hồ Chí Minh', 'province_id' => 209, 'district_id' => 1458, 'ward_id' => 21904, 'address_type' => 'HOME', 'is_default' => true],
        ];

        foreach ($samples as $sample) {
            DB::table('addresses')->updateOrInsert(
                ['user_id' => $customerId, 'address' => $sample['address']],
                array_merge($sample, ['user_id' => $customerId, 'updated_at' => now(), 'created_at' => now()])
            );

            $addressId = DB::table('addresses')->where('user_id', $customerId)->where('address', $sample['address'])->value('id');
            if ($addressId) {
                DB::table('user_address')->updateOrInsert(
                    ['user_id' => $customerId, 'address_id' => $addressId],
                    ['is_default' => $sample['is_default'], 'updated_at' => now(), 'created_at' => now()]
                );
            }
        }
    }

    private function seedFavorites(int $customerId): void
    {
        $productIds = DB::table('products')->whereIn('name', [self::PRODUCT_NAME])->pluck('id');
        foreach ($productIds as $productId) {
            DB::table('favorite_product')->updateOrInsert(
                ['user_id' => $customerId, 'product_id' => $productId],
                ['updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    private function seedCarts(int $customerId): void
    {
        $variants = DB::table('product_variants')->whereIn('sku', ['DRIFT-BLK-M', 'DRIFT-GBE-L'])->pluck('id', 'sku');
        $products = DB::table('products')->whereIn('name', [self::PRODUCT_NAME])->get()->keyBy('name');

        $samples = [
            ['sku' => 'DRIFT-BLK-M', 'product' => self::PRODUCT_NAME, 'quantity' => 2, 'attrs' => ['Kích thước' => 'M', 'Màu sắc' => 'Đen']],
            ['sku' => 'DRIFT-GBE-L', 'product' => self::PRODUCT_NAME, 'quantity' => 1, 'attrs' => ['Kích thước' => 'L', 'Màu sắc' => 'Xám be']],
        ];

        foreach ($samples as $sample) {
            $variantId = $variants[$sample['sku']] ?? null;
            $product = $products[$sample['product']] ?? null;
            if (!$variantId || !$product) {
                continue;
            }

            DB::table('carts')->updateOrInsert(
                ['user_id' => $customerId, 'product_variant_id' => $variantId],
                [
                    'quantity' => $sample['quantity'],
                    'status' => Status::ACTIVE->value,
                    'list_price_snapshot' => $product->sale_price,
                    'url_image_snapshot' => $product->url_image_cover,
                    'name_product_snapshot' => $product->name,
                    'variant_attributes_snapshot' => json_encode($sample['attrs']),
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}
