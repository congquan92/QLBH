<?php

namespace Database\Seeders;

use App\Enums\DeliveryStatus;
use App\Enums\Status;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImportDemoSeeder extends Seeder
{
    private const PRODUCT_NAME = 'Dép Nam ICONDENIM Drift Slides';

    public function run(): void
    {
        DB::transaction(function (): void {
            $variantRows = DB::table('product_variants')->whereIn('sku', ['DRIFT-BLK-M', 'DRIFT-GBE-L'])->get()->keyBy('sku');
            $productRows = DB::table('products')->whereIn('name', [self::PRODUCT_NAME])->get()->keyBy('name');

            $imports = [
                ['description' => 'Nhập demo dép nam màu Đen size M', 'product' => self::PRODUCT_NAME, 'status' => DeliveryStatus::COMPLETED->value, 'details' => [['sku' => 'DRIFT-BLK-M', 'qty' => 20, 'unit' => 240000, 'attrs' => ['Kích thước' => 'M', 'Màu sắc' => 'Đen']]]],
                ['description' => 'Nhập demo dép nam màu Xám be size L', 'product' => self::PRODUCT_NAME, 'status' => DeliveryStatus::CONFIRMED->value, 'details' => [['sku' => 'DRIFT-GBE-L', 'qty' => 12, 'unit' => 245000, 'attrs' => ['Kích thước' => 'L', 'Màu sắc' => 'Xám be']]]],
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
