<?php

namespace Database\Seeders;

use App\Enums\Status;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CatalogDemoSeeder extends Seeder
{
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
            ['name' => 'NCC Thoi Trang Viet', 'address' => '12 Nguyen Hue', 'province' => 'Ho Chi Minh', 'district' => 'Quan 1', 'ward' => 'Ben Nghe', 'province_id' => '79', 'district_id' => '760', 'ward_id' => '26734', 'phone' => '0280000001', 'status' => Status::ACTIVE->value],
            ['name' => 'NCC Giay Dep Sai Gon', 'address' => '88 Le Loi', 'province' => 'Ho Chi Minh', 'district' => 'Quan 1', 'ward' => 'Ben Thanh', 'province_id' => '79', 'district_id' => '760', 'ward_id' => '26740', 'phone' => '0280000002', 'status' => Status::ACTIVE->value],
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
            'Thoi Trang' => ['Ao Thun', 'Ao So Mi'],
            'Giay Dep' => ['Sneaker', 'Sandal'],
            'Phu Kien' => ['Tui Xach', 'Balo'],
        ];

        foreach ($samples as $parentName => $children) {
            DB::table('categories')->updateOrInsert(
                ['name' => $parentName, 'parent_id' => null],
                ['status' => Status::ACTIVE->value, 'updated_at' => now(), 'created_at' => now()]
            );

            $parentId = DB::table('categories')->where('name', $parentName)->whereNull('parent_id')->value('id');
            if (!$parentId) {
                continue;
            }

            foreach ($children as $childName) {
                DB::table('categories')->updateOrInsert(
                    ['name' => $childName, 'parent_id' => $parentId],
                    ['status' => Status::ACTIVE->value, 'updated_at' => now(), 'created_at' => now()]
                );
            }
        }
    }

    private function seedProducts(): void
    {
        $supplierIds = DB::table('suppliers')->whereIn('name', ['NCC Thoi Trang Viet', 'NCC Giay Dep Sai Gon'])->pluck('id', 'name');
        $categoryIds = DB::table('categories')->whereIn('name', ['Ao Thun', 'Ao So Mi', 'Sneaker', 'Sandal', 'Tui Xach', 'Balo'])->pluck('id', 'name');

        $samples = [
            ['name' => 'Ao Thun Basic Nam', 'description' => 'Ao thun cotton mac hang ngay, form regular.', 'url_image_cover' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80', 'list_price' => 249000, 'sale_price' => 199000, 'sold_quantity' => 120, 'avg_rating' => 4.6, 'supplier' => 'NCC Thoi Trang Viet', 'category' => 'Ao Thun'],
            ['name' => 'Ao So Mi Trang Cong So', 'description' => 'Ao so mi vai mem, de ui, phu hop di lam.', 'url_image_cover' => 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80', 'list_price' => 399000, 'sale_price' => 329000, 'sold_quantity' => 85, 'avg_rating' => 4.5, 'supplier' => 'NCC Thoi Trang Viet', 'category' => 'Ao So Mi'],
            ['name' => 'Giay Sneaker Trang', 'description' => 'Sneaker de em, nhe, phoi do de.', 'url_image_cover' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80', 'list_price' => 990000, 'sale_price' => 850000, 'sold_quantity' => 60, 'avg_rating' => 4.7, 'supplier' => 'NCC Giay Dep Sai Gon', 'category' => 'Sneaker'],
            ['name' => 'Sandal Nu Mua He', 'description' => 'Sandal quai mem, de chong truot.', 'url_image_cover' => 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80', 'list_price' => 420000, 'sale_price' => 359000, 'sold_quantity' => 44, 'avg_rating' => 4.4, 'supplier' => 'NCC Giay Dep Sai Gon', 'category' => 'Sandal'],
            ['name' => 'Tui Deo Cheo Mini', 'description' => 'Tui nho gon, chong nuoc nhe, hop di choi.', 'url_image_cover' => 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=80', 'list_price' => 520000, 'sale_price' => 469000, 'sold_quantity' => 38, 'avg_rating' => 4.5, 'supplier' => 'NCC Thoi Trang Viet', 'category' => 'Tui Xach'],
            ['name' => 'Balo Laptop Chong Nuoc', 'description' => 'Balo 15.6 inch, ngan khoa hoc, de deo.', 'url_image_cover' => 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=1200&q=80', 'list_price' => 790000, 'sale_price' => 699000, 'sold_quantity' => 52, 'avg_rating' => 4.6, 'supplier' => 'NCC Thoi Trang Viet', 'category' => 'Balo'],
        ];

        foreach ($samples as $sample) {
            DB::table('products')->updateOrInsert(
                ['name' => $sample['name']],
                [
                    'description' => $sample['description'],
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
        $productIds = DB::table('products')->whereIn('name', ['Ao Thun Basic Nam', 'Ao So Mi Trang Cong So', 'Giay Sneaker Trang', 'Sandal Nu Mua He', 'Tui Deo Cheo Mini', 'Balo Laptop Chong Nuoc'])->pluck('id', 'name');

        $samples = [
            ['sku' => 'TS-BASIC-M-BLACK', 'product' => 'Ao Thun Basic Nam', 'price' => 199000, 'quantity' => 80, 'weight' => 250, 'length' => 30, 'width' => 20, 'height' => 3],
            ['sku' => 'TS-BASIC-L-WHITE', 'product' => 'Ao Thun Basic Nam', 'price' => 199000, 'quantity' => 65, 'weight' => 260, 'length' => 30, 'width' => 20, 'height' => 3],
            ['sku' => 'SM-WHITE-M', 'product' => 'Ao So Mi Trang Cong So', 'price' => 329000, 'quantity' => 50, 'weight' => 300, 'length' => 35, 'width' => 25, 'height' => 3],
            ['sku' => 'SN-WHITE-41', 'product' => 'Giay Sneaker Trang', 'price' => 850000, 'quantity' => 40, 'weight' => 700, 'length' => 32, 'width' => 22, 'height' => 12],
            ['sku' => 'SN-WHITE-42', 'product' => 'Giay Sneaker Trang', 'price' => 850000, 'quantity' => 35, 'weight' => 710, 'length' => 32, 'width' => 22, 'height' => 12],
            ['sku' => 'SD-NU-37', 'product' => 'Sandal Nu Mua He', 'price' => 359000, 'quantity' => 30, 'weight' => 500, 'length' => 30, 'width' => 20, 'height' => 10],
            ['sku' => 'TUI-MINI-BE', 'product' => 'Tui Deo Cheo Mini', 'price' => 469000, 'quantity' => 28, 'weight' => 400, 'length' => 25, 'width' => 18, 'height' => 8],
            ['sku' => 'BALO-15-BLACK', 'product' => 'Balo Laptop Chong Nuoc', 'price' => 699000, 'quantity' => 33, 'weight' => 900, 'length' => 45, 'width' => 30, 'height' => 15],
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
        $products = DB::table('products')->whereIn('name', ['Ao Thun Basic Nam', 'Giay Sneaker Trang', 'Balo Laptop Chong Nuoc'])->pluck('id', 'name');

        $map = [
            'Ao Thun Basic Nam' => [
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
            ],
            'Giay Sneaker Trang' => [
                'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80',
            ],
            'Balo Laptop Chong Nuoc' => [
                'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=800&q=80',
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
}
