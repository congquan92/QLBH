<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductAttributeDemoSeeder extends Seeder
{
    private const PRODUCT_NAME = 'Dép Nam ICONDENIM Drift Slides';

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
        foreach (['Màu sắc', 'Kích thước'] as $name) {
            DB::table('attributes')->updateOrInsert(
                ['name' => $name],
                ['updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    private function seedProductAttributes(): void
    {
        $productIds = DB::table('products')->whereIn('name', [self::PRODUCT_NAME])->pluck('id');
        $attributeIds = DB::table('attributes')->whereIn('name', ['Màu sắc', 'Kích thước'])->pluck('id');

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
        $attributes = DB::table('attributes')->whereIn('name', ['Màu sắc', 'Kích thước'])->pluck('id', 'name');
        $products = DB::table('products')->whereIn('name', [self::PRODUCT_NAME])->pluck('id', 'name');

        $spec = [
            self::PRODUCT_NAME => [
                'Màu sắc' => [
                    ['value' => 'Đen', 'url_image' => 'https://cdn.hstatic.net/products/1000253775/160_dep_039-4_aefebb92930a4c60a12fa2bae5b97a2f_1024x1024.jpg'],
                    ['value' => 'Xám be', 'url_image' => 'https://cdn.hstatic.net/products/1000253775/160_dep_039-2_ebcd85b035f440c7b6075b07e9833ed8_1024x1024.jpg'],
                ],
                'Kích thước' => [
                    ['value' => 'S', 'url_image' => null],
                    ['value' => 'M', 'url_image' => null],
                    ['value' => 'L', 'url_image' => null],
                    ['value' => 'XL', 'url_image' => null],
                ],
            ],
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

                foreach ($values as $valueRow) {
                    DB::table('product_attribute_values')->updateOrInsert(
                        ['product_attribute_id' => $productAttributeId, 'value' => $valueRow['value']],
                        ['url_image' => $valueRow['url_image'], 'updated_at' => now(), 'created_at' => now()]
                    );
                }
            }
        }
    }

    private function seedVariantAttributeMap(): void
    {
        $bindings = [
            'DRIFT-BLK-S' => ['product' => self::PRODUCT_NAME, 'Màu sắc' => 'Đen', 'Kích thước' => 'S'],
            'DRIFT-BLK-M' => ['product' => self::PRODUCT_NAME, 'Màu sắc' => 'Đen', 'Kích thước' => 'M'],
            'DRIFT-BLK-L' => ['product' => self::PRODUCT_NAME, 'Màu sắc' => 'Đen', 'Kích thước' => 'L'],
            'DRIFT-BLK-XL' => ['product' => self::PRODUCT_NAME, 'Màu sắc' => 'Đen', 'Kích thước' => 'XL'],
            'DRIFT-GBE-S' => ['product' => self::PRODUCT_NAME, 'Màu sắc' => 'Xám be', 'Kích thước' => 'S'],
            'DRIFT-GBE-M' => ['product' => self::PRODUCT_NAME, 'Màu sắc' => 'Xám be', 'Kích thước' => 'M'],
            'DRIFT-GBE-L' => ['product' => self::PRODUCT_NAME, 'Màu sắc' => 'Xám be', 'Kích thước' => 'L'],
            'DRIFT-GBE-XL' => ['product' => self::PRODUCT_NAME, 'Màu sắc' => 'Xám be', 'Kích thước' => 'XL'],
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

            foreach (['Màu sắc', 'Kích thước'] as $attributeName) {
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