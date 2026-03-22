<?php

namespace Database\Seeders;

use App\Enums\DeliveryStatus;
use App\Enums\Status;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * ImportSeeder — phiếu nhập kho thực tế cho từng sản phẩm.
 */
class ImportSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $variants = DB::table('product_variants')->get()->keyBy('sku');
            $products = DB::table('products')->get()->keyBy('id');

            $imports = [
                [
                    'description' => 'Nhập áo thun cổ tròn đợt 1 - tháng 1/2026',
                    'skus'        => [
                        ['sku' => 'ATN-BAS-DEN-S',  'qty' => 50, 'unit_price' => 100_000],
                        ['sku' => 'ATN-BAS-DEN-M',  'qty' => 80, 'unit_price' => 100_000],
                        ['sku' => 'ATN-BAS-DEN-L',  'qty' => 60, 'unit_price' => 100_000],
                        ['sku' => 'ATN-BAS-TRG-M',  'qty' => 60, 'unit_price' => 100_000],
                        ['sku' => 'ATN-BAS-TRG-L',  'qty' => 50, 'unit_price' => 100_000],
                    ],
                    'status' => DeliveryStatus::COMPLETED->value,
                ],
                [
                    'description' => 'Nhập áo polo pique đợt 1 - tháng 1/2026',
                    'skus'        => [
                        ['sku' => 'APO-PIQ-NAV-M',  'qty' => 40, 'unit_price' => 160_000],
                        ['sku' => 'APO-PIQ-NAV-L',  'qty' => 50, 'unit_price' => 160_000],
                        ['sku' => 'APO-PIQ-TRG-M',  'qty' => 35, 'unit_price' => 160_000],
                        ['sku' => 'APO-PIQ-TRG-L',  'qty' => 40, 'unit_price' => 160_000],
                    ],
                    'status' => DeliveryStatus::COMPLETED->value,
                ],
                [
                    'description' => 'Nhập quần jean slim fit đợt 1 - tháng 2/2026',
                    'skus'        => [
                        ['sku' => 'QJN-SLM-XAD-28', 'qty' => 25, 'unit_price' => 230_000],
                        ['sku' => 'QJN-SLM-XAD-30', 'qty' => 40, 'unit_price' => 230_000],
                        ['sku' => 'QJN-SLM-XAD-32', 'qty' => 25, 'unit_price' => 230_000],
                    ],
                    'status' => DeliveryStatus::COMPLETED->value,
                ],
                [
                    'description' => 'Nhập dép nam quai ngang đợt 1 - tháng 2/2026',
                    'skus'        => [
                        ['sku' => 'DEP-QN-DEN-39', 'qty' => 30, 'unit_price' => 130_000],
                        ['sku' => 'DEP-QN-DEN-40', 'qty' => 40, 'unit_price' => 130_000],
                        ['sku' => 'DEP-QN-DEN-41', 'qty' => 45, 'unit_price' => 130_000],
                        ['sku' => 'DEP-QN-NHU-40', 'qty' => 25, 'unit_price' => 130_000],
                    ],
                    'status' => DeliveryStatus::COMPLETED->value,
                ],
                [
                    'description' => 'Nhập áo khoác bomber đợt 1 - tháng 3/2026',
                    'skus'        => [
                        ['sku' => 'AKO-BOM-DEN-M',  'qty' => 25, 'unit_price' => 320_000],
                        ['sku' => 'AKO-BOM-DEN-L',  'qty' => 30, 'unit_price' => 320_000],
                        ['sku' => 'AKO-BOM-REM-L',  'qty' => 25, 'unit_price' => 320_000],
                    ],
                    'status' => DeliveryStatus::CONFIRMED->value, // Đang chờ nhập
                ],
            ];

            foreach ($imports as $import) {
                // Lấy product từ sku đầu tiên
                $firstSku    = $import['skus'][0]['sku'];
                $firstVariant = $variants[$firstSku] ?? null;
                if (!$firstVariant) continue;

                $product   = $products[$firstVariant->product_id] ?? null;
                $productId = $product?->id ?? null;

                $totalAmount = array_sum(array_map(
                    fn($s) => $s['qty'] * $s['unit_price'],
                    $import['skus']
                ));

                DB::table('import_products')->updateOrInsert(
                    ['description' => $import['description'], 'product_id' => $productId],
                    [
                        'totalAmount' => $totalAmount,
                        'status'      => $import['status'],
                        'view_status' => Status::ACTIVE->value,
                        'updated_at'  => now(),
                        'created_at'  => now(),
                    ]
                );

                $importId = DB::table('import_products')
                    ->where('description', $import['description'])
                    ->where('product_id', $productId)
                    ->value('id');

                if (!$importId) continue;

                foreach ($import['skus'] as $skuData) {
                    $variant = $variants[$skuData['sku']] ?? null;
                    if (!$variant) continue;

                    $prod = $products[$variant->product_id] ?? null;

                    DB::table('import_details')->updateOrInsert(
                        ['import_product_id' => $importId, 'product_variant_id' => $variant->id],
                        [
                            'nameProductSnapShot'       => $prod?->name ?? '',
                            'quantity'                  => $skuData['qty'],
                            'unitPrice'                 => $skuData['unit_price'],
                            'urlImageSnapShot'          => $prod?->url_image_cover ?? '',
                            'variantAttributesSnapshot' => '{}',
                            'updated_at'                => now(),
                            'created_at'                => now(),
                        ]
                    );
                }
            }
        });
    }
}
