<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductAttributeDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->seedAttributes();
            $this->seedProductAttributes();
            $this->seedProductAttributeValues();
            $this->seedVariantAttributeMap();
        });
    }

    private function seedAttributes(): void
    {
        foreach (['Color', 'Size'] as $name) {
            DB::table('attributes')->updateOrInsert(
                ['name' => $name],
                ['updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    private function seedProductAttributes(): void
    {
        $productIds = DB::table('products')->whereIn('name', ['Ao Thun Basic Nam', 'Ao So Mi Trang Cong So', 'Giay Sneaker Trang', 'Sandal Nu Mua He'])->pluck('id');
        $attributeIds = DB::table('attributes')->whereIn('name', ['Color', 'Size'])->pluck('id');

        foreach ($productIds as $productId) {
            foreach ($attributeIds as $attributeId) {
                DB::table('product_attributes')->updateOrInsert(
                    ['product_id' => $productId, 'attribute_id' => $attributeId],
                    ['updated_at' => now(), 'created_at' => now()]
                );
            }
        }
    }

    private function seedProductAttributeValues(): void
    {
        $attributes = DB::table('attributes')->whereIn('name', ['Color', 'Size'])->pluck('id', 'name');
        $products = DB::table('products')->whereIn('name', ['Ao Thun Basic Nam', 'Ao So Mi Trang Cong So', 'Giay Sneaker Trang', 'Sandal Nu Mua He'])->pluck('id', 'name');

        $spec = [
            'Ao Thun Basic Nam' => ['Color' => ['Black', 'White'], 'Size' => ['M', 'L']],
            'Ao So Mi Trang Cong So' => ['Color' => ['White'], 'Size' => ['M']],
            'Giay Sneaker Trang' => ['Color' => ['White'], 'Size' => ['41', '42']],
            'Sandal Nu Mua He' => ['Color' => ['Nude'], 'Size' => ['37']],
        ];

        foreach ($spec as $productName => $groups) {
            $productId = $products[$productName] ?? null;
            if (!$productId) {
                continue;
            }

            foreach ($groups as $attributeName => $values) {
                $attributeId = $attributes[$attributeName] ?? null;
                if (!$attributeId) {
                    continue;
                }

                $productAttributeId = DB::table('product_attributes')
                    ->where('product_id', $productId)
                    ->where('attribute_id', $attributeId)
                    ->value('id');

                if (!$productAttributeId) {
                    continue;
                }

                foreach ($values as $value) {
                    DB::table('product_attribute_values')->updateOrInsert(
                        ['product_attribute_id' => $productAttributeId, 'value' => $value],
                        ['url_image' => null, 'updated_at' => now(), 'created_at' => now()]
                    );
                }
            }
        }
    }

    private function seedVariantAttributeMap(): void
    {
        $bindings = [
            'TS-BASIC-M-BLACK' => ['product' => 'Ao Thun Basic Nam', 'Color' => 'Black', 'Size' => 'M'],
            'TS-BASIC-L-WHITE' => ['product' => 'Ao Thun Basic Nam', 'Color' => 'White', 'Size' => 'L'],
            'SM-WHITE-M' => ['product' => 'Ao So Mi Trang Cong So', 'Color' => 'White', 'Size' => 'M'],
            'SN-WHITE-41' => ['product' => 'Giay Sneaker Trang', 'Color' => 'White', 'Size' => '41'],
            'SN-WHITE-42' => ['product' => 'Giay Sneaker Trang', 'Color' => 'White', 'Size' => '42'],
            'SD-NU-37' => ['product' => 'Sandal Nu Mua He', 'Color' => 'Nude', 'Size' => '37'],
        ];

        $attributes = DB::table('attributes')->pluck('id', 'name');
        $products = DB::table('products')->pluck('id', 'name');
        $variants = DB::table('product_variants')->whereIn('sku', array_keys($bindings))->pluck('id', 'sku');

        foreach ($bindings as $sku => $values) {
            $variantId = $variants[$sku] ?? null;
            $productId = $products[$values['product']] ?? null;
            if (!$variantId || !$productId) {
                continue;
            }

            foreach (['Color', 'Size'] as $attributeName) {
                $attributeId = $attributes[$attributeName] ?? null;
                if (!$attributeId) {
                    continue;
                }

                $productAttributeId = DB::table('product_attributes')
                    ->where('product_id', $productId)
                    ->where('attribute_id', $attributeId)
                    ->value('id');

                if (!$productAttributeId) {
                    continue;
                }

                $valueId = DB::table('product_attribute_values')
                    ->where('product_attribute_id', $productAttributeId)
                    ->where('value', $values[$attributeName])
                    ->value('id');

                if (!$valueId) {
                    continue;
                }

                DB::table('product_variant_attribute_value')->updateOrInsert(
                    ['product_variant_id' => $variantId, 'product_attribute_value_id' => $valueId],
                    ['updated_at' => now(), 'created_at' => now()]
                );
            }
        }
    }
}
