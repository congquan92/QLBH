<?php

namespace Database\Seeders;

use App\Enums\DeliveryStatus;
use App\Enums\Status;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImportDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $variantRows = DB::table('product_variants')->whereIn('sku', ['TS-BASIC-M-BLACK', 'SN-WHITE-41', 'BALO-15-BLACK'])->get()->keyBy('sku');
            $productRows = DB::table('products')->whereIn('name', ['Ao Thun Basic Nam', 'Giay Sneaker Trang', 'Balo Laptop Chong Nuoc'])->get()->keyBy('name');

            $imports = [
                ['description' => 'Nhap demo Ao Thun Basic Nam', 'product' => 'Ao Thun Basic Nam', 'status' => DeliveryStatus::COMPLETED->value, 'details' => [['sku' => 'TS-BASIC-M-BLACK', 'qty' => 20, 'unit' => 150000, 'attrs' => ['size' => 'M', 'color' => 'Black']]]],
                ['description' => 'Nhap demo Giay Sneaker Trang', 'product' => 'Giay Sneaker Trang', 'status' => DeliveryStatus::CONFIRMED->value, 'details' => [['sku' => 'SN-WHITE-41', 'qty' => 10, 'unit' => 650000, 'attrs' => ['size' => '41', 'color' => 'White']]]],
                ['description' => 'Nhap demo Balo Laptop', 'product' => 'Balo Laptop Chong Nuoc', 'status' => DeliveryStatus::PENDING->value, 'details' => [['sku' => 'BALO-15-BLACK', 'qty' => 12, 'unit' => 520000, 'attrs' => ['size' => '15.6 inch', 'color' => 'Black']]]],
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
                    ['totalAmount' => $totalAmount, 'status' => $import['status'], 'view_status' => Status::ACTIVE->value, 'updated_at' => now(), 'created_at' => now()]
                );

                $importProductId = DB::table('import_products')->where('description', $import['description'])->where('product_id', $product->id)->value('id');
                if (!$importProductId) {
                    continue;
                }

                foreach ($import['details'] as $detail) {
                    $variant = $variantRows[$detail['sku']] ?? null;
                    if (!$variant) {
                        continue;
                    }

                    DB::table('import_details')->updateOrInsert(
                        ['import_product_id' => $importProductId, 'product_variant_id' => $variant->id, 'nameProductSnapShot' => $product->name],
                        ['quantity' => $detail['qty'], 'unitPrice' => $detail['unit'], 'urlImageSnapShot' => $product->url_image_cover, 'variantAttributesSnapshot' => json_encode($detail['attrs']), 'updated_at' => now(), 'created_at' => now()]
                    );
                }
            }
        });
    }
}
