<?php

namespace Database\Seeders;

use App\Enums\Status;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CatalogDemoSeeder extends Seeder
{
    private const PRODUCT_NAME = 'Dép Nam ICONDENIM Drift Slides';

    public function run(): void
    {
        DB::transaction(function (): void {
            $this->seedSuppliers();
            $this->seedCategories();
            $this->seedProducts();
            $this->seedVariants();
            $this->seedProductImages();
        });
    }

    private function seedSuppliers(): void
    {
        $samples = [
            [
                'name' => 'ABCD',
                'address' => 'abcd',
                'province' => 'Hồ Chí Minh',
                'district' => 'Quận Bình Tân',
                'ward' => 'Phường Bình Hưng Hoà A',
                'province_id' => '209',
                'district_id' => '1458',
                'ward_id' => '21904',
                'phone' => '0399097211',
                'status' => Status::ACTIVE->value,
            ],
        ];

        foreach ($samples as $sample) {
            DB::table('suppliers')->updateOrInsert(
                ['name' => $sample['name']],
                array_merge($sample, ['updated_at' => now(), 'created_at' => now()])
            );
        }
    }

    private function seedCategories(): void
    {
        $samples = [
          
                
                    [
                        'name' => 'Áo nam',
                        'childCategories' => [
                            ['name' => 'Áo thun', 'childCategories' => []],
                            ['name' => 'Áo polo', 'childCategories' => []],
                            ['name' => 'Áo sơ mi', 'childCategories' => []],
                            ['name' => 'Áo khoác', 'childCategories' => []],
                            ['name' => 'Áo ba lỗ', 'childCategories' => []],
                            ['name' => 'Set quần áo', 'childCategories' => []],
                            ['name' => 'Áo nỉ - sweatshirt', 'childCategories' => []],
                            ['name' => 'Áo hoodie', 'childCategories' => []],
                            ['name' => 'Áo len', 'childCategories' => []],
                        ],
                    ],
                    [
                        'name' => 'Quần nam',
                        'childCategories' => [
                            ['name' => 'Quần jean', 'childCategories' => []],
                            ['name' => 'Quần short', 'childCategories' => []],
                            ['name' => 'Quần tây', 'childCategories' => []],
                            ['name' => 'Quần jogger - quần dài', 'childCategories' => []],
                            ['name' => 'Quần kaki', 'childCategories' => []],
                            ['name' => 'Set quần áo', 'childCategories' => []],
                            ['name' => 'Quần boxer', 'childCategories' => []],
                        ],
                    ],
                    [
                        'name' => 'Phụ kiện',
                        'childCategories' => [
                            ['name' => 'Nón', 'childCategories' => []],
                            ['name' => 'Thắt lưng', 'childCategories' => []],
                            ['name' => 'Balo - Túi xách', 'childCategories' => []],
                            ['name' => 'Ví', 'childCategories' => []],
                            ['name' => 'Giày - Dép', 'childCategories' => []],
                            ['name' => 'Mắt kính', 'childCategories' => []],
                            ['name' => 'Vớ', 'childCategories' => []],
                        ],
                    ],
                
            
        ];

        foreach ($samples as $node) {
            $this->upsertCategoryTree($node);
        }
    }

    private function seedProducts(): void
    {
        $supplierIds = DB::table('suppliers')->whereIn('name', ['ABCD'])->pluck('id', 'name');
        $categoryIds = DB::table('categories')->whereIn('name', ['Giày - Dép'])->pluck('id', 'name');

        $samples = [
            [
                'name' => self::PRODUCT_NAME,
                'description' => 'Dép nam phong cách thể thao, chất liệu cao su cao cấp, êm chân và bền bỉ.',
                'url_video' => 'https://res.cloudinary.com/dca5zhgbs/video/upload/v1762049707/y1paxnxszr0o5x2dhf6v.mp4',
                'url_image_cover' => 'https://cdn.hstatic.net/products/1000253775/160_dep_039-7_caed09554d434eb2b1b1f83e695cf5a5_1024x1024.jpg',
                'list_price' => 329000,
                'sale_price' => 329000,
                'sold_quantity' => 0,
                'avg_rating' => 0,
                'supplier' => 'ABCD',
                'category' => 'Giày - Dép',
            ],
        ];

        foreach ($samples as $sample) {
            DB::table('products')->updateOrInsert(
                ['name' => $sample['name']],
                [
                    'description' => $sample['description'],
                    'url_video' => $sample['url_video'] ?? null,
                    'url_image_cover' => $sample['url_image_cover'],
                    'list_price' => $sample['list_price'],
                    'sale_price' => $sample['sale_price'],
                    'sold_quantity' => $sample['sold_quantity'],
                    'avg_rating' => $sample['avg_rating'],
                    'supplier_id' => $supplierIds[$sample['supplier']] ?? 1,
                    'category_id' => $categoryIds[$sample['category']] ?? 1,
                    'status' => Status::ACTIVE->value,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }

    private function seedVariants(): void
    {
        $productIds = DB::table('products')->whereIn('name', [self::PRODUCT_NAME])->pluck('id', 'name');

        $samples = [
            ['sku' => 'DRIFT-BLK-S', 'product' => self::PRODUCT_NAME, 'price' => 329000, 'quantity' => 25, 'weight' => 350, 'length' => 25, 'width' => 10, 'height' => 4],
            ['sku' => 'DRIFT-BLK-M', 'product' => self::PRODUCT_NAME, 'price' => 329000, 'quantity' => 25, 'weight' => 360, 'length' => 26, 'width' => 11, 'height' => 4],
            ['sku' => 'DRIFT-BLK-L', 'product' => self::PRODUCT_NAME, 'price' => 329000, 'quantity' => 25, 'weight' => 370, 'length' => 27, 'width' => 11, 'height' => 5],
            ['sku' => 'DRIFT-BLK-XL', 'product' => self::PRODUCT_NAME, 'price' => 329000, 'quantity' => 25, 'weight' => 380, 'length' => 28, 'width' => 12, 'height' => 5],
            ['sku' => 'DRIFT-GBE-S', 'product' => self::PRODUCT_NAME, 'price' => 329000, 'quantity' => 25, 'weight' => 350, 'length' => 25, 'width' => 10, 'height' => 4],
            ['sku' => 'DRIFT-GBE-M', 'product' => self::PRODUCT_NAME, 'price' => 329000, 'quantity' => 25, 'weight' => 360, 'length' => 26, 'width' => 11, 'height' => 4],
            ['sku' => 'DRIFT-GBE-L', 'product' => self::PRODUCT_NAME, 'price' => 329000, 'quantity' => 25, 'weight' => 370, 'length' => 27, 'width' => 11, 'height' => 5],
            ['sku' => 'DRIFT-GBE-XL', 'product' => self::PRODUCT_NAME, 'price' => 329000, 'quantity' => 25, 'weight' => 380, 'length' => 28, 'width' => 12, 'height' => 5],
        ];

        foreach ($samples as $sample) {
            DB::table('product_variants')->updateOrInsert(
                ['sku' => $sample['sku']],
                [
                    'product_id' => $productIds[$sample['product']] ?? 1,
                    'price' => $sample['price'],
                    'quantity' => $sample['quantity'],
                    'weight' => $sample['weight'],
                    'length' => $sample['length'],
                    'width' => $sample['width'],
                    'height' => $sample['height'],
                    'status' => Status::ACTIVE->value,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }

    private function seedProductImages(): void
    {
        $products = DB::table('products')->whereIn('name', [self::PRODUCT_NAME])->pluck('id', 'name');

        $map = [
            self::PRODUCT_NAME => [
                'https://cdn.hstatic.net/products/1000253775/160_dep_039-7_caed09554d434eb2b1b1f83e695cf5a5_1024x1024.jpg',
                'https://cdn.hstatic.net/products/1000253775/160_dep_039-2_ebcd85b035f440c7b6075b07e9833ed8_1024x1024.jpg',
                'https://cdn.hstatic.net/products/1000253775/160_dep_039-8_13c6279f93564d71a2bba4b094c77500_1024x1024.jpg',
                'https://cdn.hstatic.net/products/1000253775/160_dep_039-4_aefebb92930a4c60a12fa2bae5b97a2f_1024x1024.jpg',
            ],
        ];

        foreach ($map as $productName => $urls) {
            $productId = $products[$productName] ?? null;
            if (!$productId) {
                continue;
            }

            foreach ($urls as $url) {
                DB::table('image_products')->updateOrInsert(
                    ['product_id' => $productId, 'url' => $url],
                    ['updated_at' => now(), 'created_at' => now()]
                );
            }
        }
    }

    private function upsertCategoryTree(array $node, ?int $parentId = null): ?int
    {
        DB::table('categories')->updateOrInsert(
            ['name' => $node['name'], 'parent_id' => $parentId],
            ['status' => Status::ACTIVE->value, 'updated_at' => now(), 'created_at' => now()]
        );

        $currentId = DB::table('categories')
            ->where('name', $node['name'])
            ->where('parent_id', $parentId)
            ->value('id');

        if (!$currentId) {
            return null;
        }

        foreach ($node['childCategories'] ?? [] as $child) {
            $this->upsertCategoryTree($child, (int) $currentId);
        }

        return (int) $currentId;
    }
}
