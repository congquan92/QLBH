<?php

namespace Database\Seeders;

use App\Enums\Status;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * CatalogSeeder — nhà cung cấp, danh mục, sản phẩm thời trang nam thực tế.
 */
class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->seedSuppliers();
            $this->seedCategories();
            $this->seedProducts();
        });
    }

    // ─── Nhà cung cấp ─────────────────────────────────────────────────────────
    private function seedSuppliers(): void
    {
        $suppliers = [
            [
                'name'        => 'Công ty TNHH Dệt May Tiền Phong',
                'address'     => '15 Lê Duẩn',
                'province'    => 'Hà Nội',
                'district'    => 'Quận Hai Bà Trưng',
                'ward'        => 'Phường Bùi Thị Xuân',
                'province_id' => '201',
                'district_id' => '1490',
                'ward_id'     => '20220',
                'phone'       => '02462512345',
                'status'      => Status::ACTIVE->value,
            ],
            [
                'name'        => 'Công ty CP Thời Trang Việt',
                'address'     => '120 Nguyễn Thị Minh Khai',
                'province'    => 'Hồ Chí Minh',
                'district'    => 'Quận 3',
                'ward'        => 'Phường Võ Thị Sáu',
                'province_id' => '209',
                'district_id' => '1444',
                'ward_id'     => '21304',
                'phone'       => '02839001234',
                'status'      => Status::ACTIVE->value,
            ],
            [
                'name'        => 'Xưởng May Thanh Bình',
                'address'     => '78 Lý Thái Tổ',
                'province'    => 'Đà Nẵng',
                'district'    => 'Quận Hải Châu',
                'ward'        => 'Phường Thuận Phước',
                'province_id' => '206',
                'district_id' => '1492',
                'ward_id'     => '21040',
                'phone'       => '02361234567',
                'status'      => Status::ACTIVE->value,
            ],
        ];

        foreach ($suppliers as $s) {
            DB::table('suppliers')->updateOrInsert(
                ['name' => $s['name']],
                array_merge($s, ['updated_at' => now(), 'created_at' => now()])
            );
        }
    }

    // ─── Danh mục ─────────────────────────────────────────────────────────────
    private function seedCategories(): void
    {
        $tree = [
            [
                'name' => 'Áo nam',
                'childCategories' => [
                    ['name' => 'Áo thun', 'childCategories' => []],
                    ['name' => 'Áo polo', 'childCategories' => []],
                    ['name' => 'Áo sơ mi', 'childCategories' => []],
                    ['name' => 'Áo khoác', 'childCategories' => []],
                    ['name' => 'Áo hoodie / Sweatshirt', 'childCategories' => []],
                ],
            ],
            [
                'name' => 'Quần nam',
                'childCategories' => [
                    ['name' => 'Quần jean', 'childCategories' => []],
                    ['name' => 'Quần short', 'childCategories' => []],
                    ['name' => 'Quần tây / Kaki', 'childCategories' => []],
                    ['name' => 'Quần jogger', 'childCategories' => []],
                ],
            ],
            [
                'name' => 'Phụ kiện nam',
                'childCategories' => [
                    ['name' => 'Nón / Mũ', 'childCategories' => []],
                    ['name' => 'Thắt lưng', 'childCategories' => []],
                    ['name' => 'Balo / Túi xách', 'childCategories' => []],
                    ['name' => 'Giày / Dép', 'childCategories' => []],
                    ['name' => 'Mắt kính', 'childCategories' => []],
                    ['name' => 'Vớ / Tất', 'childCategories' => []],
                ],
            ],
        ];

        foreach ($tree as $node) {
            $this->upsertCategoryTree($node);
        }
    }

    private function upsertCategoryTree(array $node, ?int $parentId = null): ?int
    {
        DB::table('categories')->updateOrInsert(
            ['name' => $node['name'], 'parent_id' => $parentId],
            ['status' => Status::ACTIVE->value, 'updated_at' => now(), 'created_at' => now()]
        );

        $id = DB::table('categories')
            ->where('name', $node['name'])
            ->where('parent_id', $parentId)
            ->value('id');

        foreach ($node['childCategories'] ?? [] as $child) {
            $this->upsertCategoryTree($child, (int) $id);
        }

        return $id ? (int) $id : null;
    }

    // ─── Sản phẩm ─────────────────────────────────────────────────────────────
    private function seedProducts(): void
    {
        $supplierIds  = DB::table('suppliers')->pluck('id', 'name');
        $categoryIds  = DB::table('categories')->pluck('id', 'name');

        $products = [
            // ── Áo thun ──────────────────────────────────────────────────────
            [
                'name'             => 'Áo Thun Nam Cổ Tròn Basic',
                'description'      => 'Áo thun nam cổ tròn chất liệu cotton 100%, thoáng mát, co giãn 4 chiều, phù hợp mặc hàng ngày.',
                'list_price'       => 199_000,
                'sale_price'       => 179_000,
                'url_image_cover'  => 'https://product.hstatic.net/200000690725/product/ao-thun-basic-den_0b9f9b8d60ba44439879cd60cc2e6b34_master.jpg',
                'category'         => 'Áo thun',
                'supplier'         => 'Công ty TNHH Dệt May Tiền Phong',
                'variants' => [
                    ['sku' => 'ATN-BAS-DEN-S',  'price' => 179_000, 'qty' => 30, 'weight' => 200, 'length' => 30, 'width' => 20, 'height' => 2, 'attrs' => ['Màu sắc' => 'Đen',  'Kích thước' => 'S']],
                    ['sku' => 'ATN-BAS-DEN-M',  'price' => 179_000, 'qty' => 50, 'weight' => 210, 'length' => 30, 'width' => 20, 'height' => 2, 'attrs' => ['Màu sắc' => 'Đen',  'Kích thước' => 'M']],
                    ['sku' => 'ATN-BAS-DEN-L',  'price' => 179_000, 'qty' => 40, 'weight' => 220, 'length' => 30, 'width' => 20, 'height' => 2, 'attrs' => ['Màu sắc' => 'Đen',  'Kích thước' => 'L']],
                    ['sku' => 'ATN-BAS-DEN-XL', 'price' => 179_000, 'qty' => 25, 'weight' => 230, 'length' => 30, 'width' => 20, 'height' => 2, 'attrs' => ['Màu sắc' => 'Đen',  'Kích thước' => 'XL']],
                    ['sku' => 'ATN-BAS-TRG-M',  'price' => 179_000, 'qty' => 40, 'weight' => 210, 'length' => 30, 'width' => 20, 'height' => 2, 'attrs' => ['Màu sắc' => 'Trắng','Kích thước' => 'M']],
                    ['sku' => 'ATN-BAS-TRG-L',  'price' => 179_000, 'qty' => 35, 'weight' => 220, 'length' => 30, 'width' => 20, 'height' => 2, 'attrs' => ['Màu sắc' => 'Trắng','Kích thước' => 'L']],
                ],
            ],
            // ── Áo polo ──────────────────────────────────────────────────────
            [
                'name'            => 'Áo Polo Nam Pique Cao Cấp',
                'description'     => 'Áo polo nam chất liệu pique cotton, cổ bẻ tinh tế, form slim-fit lịch sự phù hợp đi làm và đi chơi.',
                'list_price'      => 349_000,
                'sale_price'      => 299_000,
                'url_image_cover' => 'https://product.hstatic.net/200000690725/product/polo-pique-navy_7e6a3b3012e24d2e9a9c8ef2d8a2e4f1_master.jpg',
                'category'        => 'Áo polo',
                'supplier'        => 'Công ty CP Thời Trang Việt',
                'variants' => [
                    ['sku' => 'APO-PIQ-NAV-M',  'price' => 299_000, 'qty' => 30, 'weight' => 250, 'length' => 32, 'width' => 22, 'height' => 2, 'attrs' => ['Màu sắc' => 'Xanh Navy', 'Kích thước' => 'M']],
                    ['sku' => 'APO-PIQ-NAV-L',  'price' => 299_000, 'qty' => 35, 'weight' => 260, 'length' => 32, 'width' => 22, 'height' => 2, 'attrs' => ['Màu sắc' => 'Xanh Navy', 'Kích thước' => 'L']],
                    ['sku' => 'APO-PIQ-NAV-XL', 'price' => 299_000, 'qty' => 20, 'weight' => 270, 'length' => 32, 'width' => 22, 'height' => 2, 'attrs' => ['Màu sắc' => 'Xanh Navy', 'Kích thước' => 'XL']],
                    ['sku' => 'APO-PIQ-TRG-M',  'price' => 299_000, 'qty' => 25, 'weight' => 250, 'length' => 32, 'width' => 22, 'height' => 2, 'attrs' => ['Màu sắc' => 'Trắng',     'Kích thước' => 'M']],
                    ['sku' => 'APO-PIQ-TRG-L',  'price' => 299_000, 'qty' => 28, 'weight' => 260, 'length' => 32, 'width' => 22, 'height' => 2, 'attrs' => ['Màu sắc' => 'Trắng',     'Kích thước' => 'L']],
                ],
            ],
            // ── Quần jean ─────────────────────────────────────────────────────
            [
                'name'            => 'Quần Jean Nam Slim Fit Xanh Đậm',
                'description'     => 'Quần jean nam slim fit, chất liệu denim cao cấp co giãn nhẹ, wash xanh đậm trẻ trung, phối đồ linh hoạt.',
                'list_price'      => 499_000,
                'sale_price'      => 429_000,
                'url_image_cover' => 'https://product.hstatic.net/200000690725/product/jean-slim-dark_a1b2c3d4e5f64a7b8c9d0e1f2a3b4c5d_master.jpg',
                'category'        => 'Quần jean',
                'supplier'        => 'Công ty CP Thời Trang Việt',
                'variants' => [
                    ['sku' => 'QJN-SLM-XAD-28', 'price' => 429_000, 'qty' => 20, 'weight' => 500, 'length' => 40, 'width' => 25, 'height' => 3, 'attrs' => ['Màu sắc' => 'Xanh đậm', 'Kích thước' => '28']],
                    ['sku' => 'QJN-SLM-XAD-29', 'price' => 429_000, 'qty' => 25, 'weight' => 510, 'length' => 40, 'width' => 25, 'height' => 3, 'attrs' => ['Màu sắc' => 'Xanh đậm', 'Kích thước' => '29']],
                    ['sku' => 'QJN-SLM-XAD-30', 'price' => 429_000, 'qty' => 30, 'weight' => 520, 'length' => 40, 'width' => 25, 'height' => 3, 'attrs' => ['Màu sắc' => 'Xanh đậm', 'Kích thước' => '30']],
                    ['sku' => 'QJN-SLM-XAD-31', 'price' => 429_000, 'qty' => 22, 'weight' => 530, 'length' => 40, 'width' => 25, 'height' => 3, 'attrs' => ['Màu sắc' => 'Xanh đậm', 'Kích thước' => '31']],
                    ['sku' => 'QJN-SLM-XAD-32', 'price' => 429_000, 'qty' => 18, 'weight' => 540, 'length' => 40, 'width' => 26, 'height' => 3, 'attrs' => ['Màu sắc' => 'Xanh đậm', 'Kích thước' => '32']],
                ],
            ],
            // ── Dép nam ───────────────────────────────────────────────────────
            [
                'name'            => 'Dép Nam Quai Ngang Cao Su Đúc',
                'description'     => 'Dép nam quai ngang chất liệu cao su đúc nguyên khối, đế eva êm chân, chống trơn trượt, phù hợp đi biển và đi chơi hàng ngày.',
                'list_price'      => 279_000,
                'sale_price'      => 249_000,
                'url_image_cover' => 'https://product.hstatic.net/200000690725/product/dep-qn-den_5e4d3c2b1a094857635241302918fade_master.jpg',
                'category'        => 'Giày / Dép',
                'supplier'        => 'Xưởng May Thanh Bình',
                'variants' => [
                    ['sku' => 'DEP-QN-DEN-39', 'price' => 249_000, 'qty' => 25, 'weight' => 350, 'length' => 27, 'width' => 11, 'height' => 3, 'attrs' => ['Màu sắc' => 'Đen', 'Kích thước' => '39']],
                    ['sku' => 'DEP-QN-DEN-40', 'price' => 249_000, 'qty' => 30, 'weight' => 360, 'length' => 27, 'width' => 11, 'height' => 3, 'attrs' => ['Màu sắc' => 'Đen', 'Kích thước' => '40']],
                    ['sku' => 'DEP-QN-DEN-41', 'price' => 249_000, 'qty' => 35, 'weight' => 370, 'length' => 28, 'width' => 12, 'height' => 3, 'attrs' => ['Màu sắc' => 'Đen', 'Kích thước' => '41']],
                    ['sku' => 'DEP-QN-DEN-42', 'price' => 249_000, 'qty' => 28, 'weight' => 380, 'length' => 28, 'width' => 12, 'height' => 3, 'attrs' => ['Màu sắc' => 'Đen', 'Kích thước' => '42']],
                    ['sku' => 'DEP-QN-NHU-40', 'price' => 249_000, 'qty' => 20, 'weight' => 360, 'length' => 27, 'width' => 11, 'height' => 3, 'attrs' => ['Màu sắc' => 'Nâu',  'Kích thước' => '40']],
                    ['sku' => 'DEP-QN-NHU-41', 'price' => 249_000, 'qty' => 22, 'weight' => 370, 'length' => 28, 'width' => 12, 'height' => 3, 'attrs' => ['Màu sắc' => 'Nâu',  'Kích thước' => '41']],
                ],
            ],
            // ── Áo khoác ─────────────────────────────────────────────────────
            [
                'name'            => 'Áo Khoác Bomber Nam Phần Bông',
                'description'     => 'Áo khoác bomber nam phần bông cách nhiệt, mặt ngoài polyester chống nước, phù hợp mùa đông và đi travel.',
                'list_price'      => 699_000,
                'sale_price'      => 599_000,
                'url_image_cover' => 'https://product.hstatic.net/200000690725/product/bomber-den_f0e1d2c3b4a5968778695a4b3c2d1e0f_master.jpg',
                'category'        => 'Áo khoác',
                'supplier'        => 'Công ty TNHH Dệt May Tiền Phong',
                'variants' => [
                    ['sku' => 'AKO-BOM-DEN-M',  'price' => 599_000, 'qty' => 20, 'weight' => 600, 'length' => 40, 'width' => 30, 'height' => 5, 'attrs' => ['Màu sắc' => 'Đen',   'Kích thước' => 'M']],
                    ['sku' => 'AKO-BOM-DEN-L',  'price' => 599_000, 'qty' => 25, 'weight' => 620, 'length' => 40, 'width' => 30, 'height' => 5, 'attrs' => ['Màu sắc' => 'Đen',   'Kích thước' => 'L']],
                    ['sku' => 'AKO-BOM-DEN-XL', 'price' => 599_000, 'qty' => 15, 'weight' => 640, 'length' => 40, 'width' => 30, 'height' => 5, 'attrs' => ['Màu sắc' => 'Đen',   'Kích thước' => 'XL']],
                    ['sku' => 'AKO-BOM-REM-M',  'price' => 599_000, 'qty' => 18, 'weight' => 600, 'length' => 40, 'width' => 30, 'height' => 5, 'attrs' => ['Màu sắc' => 'Rêu',   'Kích thước' => 'M']],
                    ['sku' => 'AKO-BOM-REM-L',  'price' => 599_000, 'qty' => 20, 'weight' => 620, 'length' => 40, 'width' => 30, 'height' => 5, 'attrs' => ['Màu sắc' => 'Rêu',   'Kích thước' => 'L']],
                ],
            ],
        ];

        foreach ($products as $prod) {
            $supplierId = $supplierIds[$prod['supplier']] ?? null;
            $categoryId = $categoryIds[$prod['category']] ?? 1;

            DB::table('products')->updateOrInsert(
                ['name' => $prod['name']],
                [
                    'description'     => $prod['description'],
                    'url_image_cover' => $prod['url_image_cover'],
                    'url_video'       => null,
                    'list_price'      => $prod['list_price'],
                    'sale_price'      => $prod['sale_price'],
                    'sold_quantity'   => 0,
                    'avg_rating'      => 0,
                    'supplier_id'     => $supplierId,
                    'category_id'     => $categoryId,
                    'status'          => Status::ACTIVE->value,
                    'updated_at'      => now(),
                    'created_at'      => now(),
                ]
            );

            $productId = DB::table('products')->where('name', $prod['name'])->value('id');

            foreach ($prod['variants'] as $v) {
                DB::table('product_variants')->updateOrInsert(
                    ['sku' => $v['sku']],
                    [
                        'product_id' => $productId,
                        'price'      => $v['price'],
                        'quantity'   => $v['qty'],
                        'weight'     => $v['weight'],
                        'length'     => $v['length'],
                        'width'      => $v['width'],
                        'height'     => $v['height'],
                        'status'     => Status::ACTIVE->value,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );

                // Attributes — theo đúng schema:
                // attributes(id,name) → product_attributes(product_id, attribute_id)
                // → product_attribute_values(product_attribute_id, value)
                // → product_variant_attribute_value(product_variant_id, product_attribute_value_id)
                $variantId = DB::table('product_variants')->where('sku', $v['sku'])->value('id');
                if ($variantId && !empty($v['attrs'])) {
                    foreach ($v['attrs'] as $attrName => $attrValue) {
                        // 1. Upsert attribute (chỉ có name, không có product_id)
                        DB::table('attributes')->updateOrInsert(
                            ['name' => $attrName],
                            ['updated_at' => now(), 'created_at' => now()]
                        );
                        $attrId = DB::table('attributes')->where('name', $attrName)->value('id');
                        if (!$attrId) continue;

                        // 2. Upsert product_attributes (bảng trung gian product ↔ attribute)
                        DB::table('product_attributes')->updateOrInsert(
                            ['product_id' => $productId, 'attribute_id' => $attrId],
                            ['updated_at' => now(), 'created_at' => now()]
                        );
                        $productAttrId = DB::table('product_attributes')
                            ->where('product_id', $productId)
                            ->where('attribute_id', $attrId)
                            ->value('id');
                        if (!$productAttrId) continue;

                        // 3. Upsert product_attribute_values
                        DB::table('product_attribute_values')->updateOrInsert(
                            ['value' => $attrValue, 'product_attribute_id' => $productAttrId],
                            ['updated_at' => now(), 'created_at' => now()]
                        );
                        $productAttrValueId = DB::table('product_attribute_values')
                            ->where('value', $attrValue)
                            ->where('product_attribute_id', $productAttrId)
                            ->value('id');
                        if (!$productAttrValueId) continue;

                        // 4. Upsert product_variant_attribute_value
                        DB::table('product_variant_attribute_value')->updateOrInsert(
                            ['product_variant_id' => $variantId, 'product_attribute_value_id' => $productAttrValueId],
                            ['updated_at' => now(), 'created_at' => now()]
                        );
                    }
                }
            }
        }
    }
}
