<?php

namespace Database\Seeders;

use App\Enums\Status;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CustomerDemoSeeder extends Seeder
{
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
            ['customer_name' => 'Customer Demo', 'phone_number' => '0900000004', 'address' => '123 Le Loi', 'ward' => 'Ben Nghe', 'district' => 'Quan 1', 'province' => 'Ho Chi Minh', 'province_id' => 79, 'district_id' => 760, 'ward_id' => 26734, 'address_type' => 'HOME', 'is_default' => true],
            ['customer_name' => 'Customer Demo', 'phone_number' => '0900000004', 'address' => '88 Nguyen Hue', 'ward' => 'Ben Thanh', 'district' => 'Quan 1', 'province' => 'Ho Chi Minh', 'province_id' => 79, 'district_id' => 760, 'ward_id' => 26740, 'address_type' => 'WORK', 'is_default' => false],
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
        $productIds = DB::table('products')->whereIn('name', ['Giay Sneaker Trang', 'Balo Laptop Chong Nuoc', 'Ao Thun Basic Nam'])->pluck('id');
        foreach ($productIds as $productId) {
            DB::table('favorite_product')->updateOrInsert(
                ['user_id' => $customerId, 'product_id' => $productId],
                ['updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    private function seedCarts(int $customerId): void
    {
        $variants = DB::table('product_variants')->whereIn('sku', ['TS-BASIC-M-BLACK', 'BALO-15-BLACK'])->pluck('id', 'sku');
        $products = DB::table('products')->whereIn('name', ['Ao Thun Basic Nam', 'Balo Laptop Chong Nuoc'])->get()->keyBy('name');

        $samples = [
            ['sku' => 'TS-BASIC-M-BLACK', 'product' => 'Ao Thun Basic Nam', 'quantity' => 2, 'attrs' => ['size' => 'M', 'color' => 'Black']],
            ['sku' => 'BALO-15-BLACK', 'product' => 'Balo Laptop Chong Nuoc', 'quantity' => 1, 'attrs' => ['size' => '15.6 inch', 'color' => 'Black']],
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
