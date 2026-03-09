<?php

namespace Database\Seeders;

use App\Enums\DeliveryStatus;
use App\Enums\Gender;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\RoleType;
use App\Enums\Status;
use App\Enums\UserStatus;
use App\Models\Cart;
use App\Models\Category;
use App\Models\ImageProduct;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SalesDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $customer = $this->resolveDemoCustomer();

            $suppliers = $this->seedSuppliers();
            $categories = $this->seedCategories();
            $products = $this->seedProducts($suppliers, $categories);
            $variants = $this->seedVariants($products);

            $this->seedProductImages($products);
            $this->seedCarts($customer, $variants, $products);
            $this->seedOrders($customer, $variants, $products);
        });
    }

    private function resolveDemoCustomer(): User
    {
        $customer = User::where('username', 'customer_demo')->first();

        if ($customer) {
            return $customer;
        }

        $userRole = Role::where('name', RoleType::USER->value)->first();
        $defaultRankId = DB::table('user_ranks')->orderBy('id')->value('id');

        return User::updateOrCreate(
            ['username' => 'customer_demo'],
            [
                'full_name' => 'Customer Demo',
                'email' => 'customer@qlbh.local',
                'phone' => '0900000004',
                'gender' => Gender::FEMALE->value,
                'password' => Hash::make('user123'),
                'status' => UserStatus::ACTIVE,
                'role_id' => $userRole?->id,
                'user_rank_id' => $defaultRankId,
            ]
        );
    }

    /**
     * @return array<string, Supplier>
     */
    private function seedSuppliers(): array
    {
        $supplierSamples = [
            [
                'name' => 'NCC Thoi Trang Viet',
                'address' => '12 Nguyen Hue',
                'province' => 'Ho Chi Minh',
                'district' => 'Quan 1',
                'ward' => 'Ben Nghe',
                'province_id' => '79',
                'district_id' => '760',
                'ward_id' => '26734',
                'phone' => '0280000001',
                'status' => Status::ACTIVE->value,
            ],
            [
                'name' => 'NCC Giay Dep Sai Gon',
                'address' => '88 Le Loi',
                'province' => 'Ho Chi Minh',
                'district' => 'Quan 1',
                'ward' => 'Ben Thanh',
                'province_id' => '79',
                'district_id' => '760',
                'ward_id' => '26740',
                'phone' => '0280000002',
                'status' => Status::ACTIVE->value,
            ],
        ];

        $suppliers = [];
        foreach ($supplierSamples as $sample) {
            $supplier = Supplier::updateOrCreate(['name' => $sample['name']], $sample);
            $suppliers[$sample['name']] = $supplier;
        }

        return $suppliers;
    }

    /**
     * @return array<string, Category>
     */
    private function seedCategories(): array
    {
        $categorySamples = [
            'Thoi Trang' => [
                'children' => ['Ao Thun', 'Ao So Mi'],
            ],
            'Giay Dep' => [
                'children' => ['Sneaker', 'Sandal'],
            ],
            'Phu Kien' => [
                'children' => ['Tui Xach', 'Balo'],
            ],
        ];

        $categories = [];
        foreach ($categorySamples as $parentName => $meta) {
            $parent = Category::updateOrCreate(
                ['name' => $parentName, 'parent_id' => null],
                ['status' => Status::ACTIVE->value]
            );

            $categories[$parentName] = $parent;

            foreach ($meta['children'] as $childName) {
                $child = Category::updateOrCreate(
                    ['name' => $childName, 'parent_id' => $parent->id],
                    ['status' => Status::ACTIVE->value]
                );

                $categories[$childName] = $child;
            }
        }

        return $categories;
    }

    /**
     * @param array<string, Supplier> $suppliers
     * @param array<string, Category> $categories
     * @return array<string, Product>
     */
    private function seedProducts(array $suppliers, array $categories): array
    {
        $productSamples = [
            [
                'name' => 'Ao Thun Basic Nam',
                'description' => 'Ao thun cotton mac hang ngay, form regular.',
                'url_image_cover' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
                'list_price' => 249000,
                'sale_price' => 199000,
                'sold_quantity' => 120,
                'avg_rating' => 4.6,
                'supplier' => 'NCC Thoi Trang Viet',
                'category' => 'Ao Thun',
            ],
            [
                'name' => 'Ao So Mi Trang Cong So',
                'description' => 'Ao so mi vai mem, de ui, phu hop di lam.',
                'url_image_cover' => 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80',
                'list_price' => 399000,
                'sale_price' => 329000,
                'sold_quantity' => 85,
                'avg_rating' => 4.5,
                'supplier' => 'NCC Thoi Trang Viet',
                'category' => 'Ao So Mi',
            ],
            [
                'name' => 'Giay Sneaker Trang',
                'description' => 'Sneaker de em, nhe, phoi do de.',
                'url_image_cover' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
                'list_price' => 990000,
                'sale_price' => 850000,
                'sold_quantity' => 60,
                'avg_rating' => 4.7,
                'supplier' => 'NCC Giay Dep Sai Gon',
                'category' => 'Sneaker',
            ],
            [
                'name' => 'Sandal Nu Mua He',
                'description' => 'Sandal quai mem, de chong truot.',
                'url_image_cover' => 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80',
                'list_price' => 420000,
                'sale_price' => 359000,
                'sold_quantity' => 44,
                'avg_rating' => 4.4,
                'supplier' => 'NCC Giay Dep Sai Gon',
                'category' => 'Sandal',
            ],
            [
                'name' => 'Tui Deo Cheo Mini',
                'description' => 'Tui nho gon, chong nuoc nhe, hop di choi.',
                'url_image_cover' => 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=80',
                'list_price' => 520000,
                'sale_price' => 469000,
                'sold_quantity' => 38,
                'avg_rating' => 4.5,
                'supplier' => 'NCC Thoi Trang Viet',
                'category' => 'Tui Xach',
            ],
            [
                'name' => 'Balo Laptop Chong Nuoc',
                'description' => 'Balo 15.6 inch, ngan khoa hoc, de deo.',
                'url_image_cover' => 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=1200&q=80',
                'list_price' => 790000,
                'sale_price' => 699000,
                'sold_quantity' => 52,
                'avg_rating' => 4.6,
                'supplier' => 'NCC Thoi Trang Viet',
                'category' => 'Balo',
            ],
        ];

        $products = [];
        foreach ($productSamples as $sample) {
            $product = Product::updateOrCreate(
                ['name' => $sample['name']],
                [
                    'description' => $sample['description'],
                    'url_image_cover' => $sample['url_image_cover'],
                    'list_price' => $sample['list_price'],
                    'sale_price' => $sample['sale_price'],
                    'sold_quantity' => $sample['sold_quantity'],
                    'avg_rating' => $sample['avg_rating'],
                    'supplier_id' => $suppliers[$sample['supplier']]->id,
                    'category_id' => $categories[$sample['category']]->id,
                    'status' => Status::ACTIVE->value,
                ]
            );

            $products[$sample['name']] = $product;
        }

        return $products;
    }

    /**
     * @param array<string, Product> $products
     * @return array<string, ProductVariant>
     */
    private function seedVariants(array $products): array
    {
        $variantSamples = [
            [
                'sku' => 'TS-BASIC-M-BLACK',
                'product' => 'Ao Thun Basic Nam',
                'price' => 199000,
                'quantity' => 80,
                'weight' => 250,
                'length' => 30,
                'width' => 20,
                'height' => 3,
            ],
            [
                'sku' => 'TS-BASIC-L-WHITE',
                'product' => 'Ao Thun Basic Nam',
                'price' => 199000,
                'quantity' => 65,
                'weight' => 260,
                'length' => 30,
                'width' => 20,
                'height' => 3,
            ],
            [
                'sku' => 'SM-WHITE-M',
                'product' => 'Ao So Mi Trang Cong So',
                'price' => 329000,
                'quantity' => 50,
                'weight' => 300,
                'length' => 35,
                'width' => 25,
                'height' => 3,
            ],
            [
                'sku' => 'SN-WHITE-41',
                'product' => 'Giay Sneaker Trang',
                'price' => 850000,
                'quantity' => 40,
                'weight' => 700,
                'length' => 32,
                'width' => 22,
                'height' => 12,
            ],
            [
                'sku' => 'SN-WHITE-42',
                'product' => 'Giay Sneaker Trang',
                'price' => 850000,
                'quantity' => 35,
                'weight' => 710,
                'length' => 32,
                'width' => 22,
                'height' => 12,
            ],
            [
                'sku' => 'SD-NU-37',
                'product' => 'Sandal Nu Mua He',
                'price' => 359000,
                'quantity' => 30,
                'weight' => 500,
                'length' => 30,
                'width' => 20,
                'height' => 10,
            ],
            [
                'sku' => 'TUI-MINI-BE',
                'product' => 'Tui Deo Cheo Mini',
                'price' => 469000,
                'quantity' => 28,
                'weight' => 400,
                'length' => 25,
                'width' => 18,
                'height' => 8,
            ],
            [
                'sku' => 'BALO-15-BLACK',
                'product' => 'Balo Laptop Chong Nuoc',
                'price' => 699000,
                'quantity' => 33,
                'weight' => 900,
                'length' => 45,
                'width' => 30,
                'height' => 15,
            ],
        ];

        $variants = [];
        foreach ($variantSamples as $sample) {
            $variant = ProductVariant::updateOrCreate(
                ['sku' => $sample['sku']],
                [
                    'product_id' => $products[$sample['product']]->id,
                    'price' => $sample['price'],
                    'quantity' => $sample['quantity'],
                    'weight' => $sample['weight'],
                    'length' => $sample['length'],
                    'width' => $sample['width'],
                    'height' => $sample['height'],
                    'status' => Status::ACTIVE->value,
                ]
            );

            $variants[$sample['sku']] = $variant;
        }

        return $variants;
    }

    /**
     * @param array<string, Product> $products
     */
    private function seedProductImages(array $products): void
    {
        $imageMap = [
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

        foreach ($imageMap as $productName => $urls) {
            if (!isset($products[$productName])) {
                continue;
            }

            $product = $products[$productName];
            foreach ($urls as $url) {
                ImageProduct::updateOrCreate(
                    ['product_id' => $product->id, 'url' => $url],
                    ['url' => $url]
                );
            }
        }
    }

    /**
     * @param array<string, ProductVariant> $variants
     * @param array<string, Product> $products
     */
    private function seedCarts(User $customer, array $variants, array $products): void
    {
        $cartSamples = [
            [
                'sku' => 'TS-BASIC-M-BLACK',
                'quantity' => 2,
                'product' => 'Ao Thun Basic Nam',
                'attributes' => ['size' => 'M', 'color' => 'Black'],
            ],
            [
                'sku' => 'BALO-15-BLACK',
                'quantity' => 1,
                'product' => 'Balo Laptop Chong Nuoc',
                'attributes' => ['size' => '15.6 inch', 'color' => 'Black'],
            ],
        ];

        foreach ($cartSamples as $sample) {
            if (!isset($variants[$sample['sku']], $products[$sample['product']])) {
                continue;
            }

            $variant = $variants[$sample['sku']];
            $product = $products[$sample['product']];

            Cart::updateOrCreate(
                [
                    'user_id' => $customer->id,
                    'product_variant_id' => $variant->id,
                ],
                [
                    'quantity' => $sample['quantity'],
                    'status' => Status::ACTIVE->value,
                    'list_price_snapshot' => $product->sale_price,
                    'url_image_snapshot' => $product->url_image_cover,
                    'name_product_snapshot' => $product->name,
                    'variant_attributes_snapshot' => $sample['attributes'],
                ]
            );
        }
    }

    /**
     * @param array<string, ProductVariant> $variants
     * @param array<string, Product> $products
     */
    private function seedOrders(User $customer, array $variants, array $products): void
    {
        $orderSamples = [
            [
                'tracking_code' => 'DEMO-ORDER-1001',
                'status' => DeliveryStatus::CONFIRMED->value,
                'payment_type' => PaymentType::COD->value,
                'payment_status' => PaymentStatus::UNPAID->value,
                'is_confirmed' => true,
                'items' => [
                    ['sku' => 'SN-WHITE-41', 'product' => 'Giay Sneaker Trang', 'qty' => 1, 'attrs' => ['size' => '41', 'color' => 'White']],
                    ['sku' => 'TUI-MINI-BE', 'product' => 'Tui Deo Cheo Mini', 'qty' => 1, 'attrs' => ['color' => 'Beige']],
                ],
            ],
            [
                'tracking_code' => 'DEMO-ORDER-1002',
                'status' => DeliveryStatus::DELIVERED->value,
                'payment_type' => PaymentType::BANK_TRANSFER->value,
                'payment_status' => PaymentStatus::PAID->value,
                'is_confirmed' => true,
                'items' => [
                    ['sku' => 'SM-WHITE-M', 'product' => 'Ao So Mi Trang Cong So', 'qty' => 1, 'attrs' => ['size' => 'M', 'color' => 'White']],
                    ['sku' => 'SD-NU-37', 'product' => 'Sandal Nu Mua He', 'qty' => 1, 'attrs' => ['size' => '37', 'color' => 'Nude']],
                ],
            ],
        ];

        foreach ($orderSamples as $sample) {
            $weight = 0;
            $length = 0;
            $width = 0;
            $height = 0;
            $originalAmount = 0;

            foreach ($sample['items'] as $item) {
                if (!isset($variants[$item['sku']])) {
                    continue;
                }

                $variant = $variants[$item['sku']];
                $qty = $item['qty'];

                $originalAmount += $variant->price * $qty;
                $weight += $variant->weight * $qty;
                $length = max($length, (int) $variant->length);
                $width = max($width, (int) $variant->width);
                $height += (int) $variant->height;
            }

            $shippingFee = 30000;
            $totalAmount = $originalAmount + $shippingFee;

            $order = Order::updateOrCreate(
                ['order_tracking_code' => $sample['tracking_code']],
                [
                    'customer_name' => $customer->full_name,
                    'customer_phone' => $customer->phone ?? '0900000004',
                    'delivery_ward_name' => 'Ben Nghe',
                    'delivery_ward_code' => '26734',
                    'delivery_district_id' => 760,
                    'delivery_province_id' => 79,
                    'delivery_district_name' => 'Quan 1',
                    'delivery_province_name' => 'Ho Chi Minh',
                    'delivery_address' => '123 Le Loi, Quan 1',
                    'service_type_id' => 2,
                    'original_order_amount' => $originalAmount,
                    'weight' => max(1, $weight),
                    'length' => max(1, $length),
                    'width' => max(1, $width),
                    'height' => max(1, $height),
                    'total_fee_for_ship' => $shippingFee,
                    'note' => 'Don hang demo duoc tao tu SalesDemoSeeder',
                    'total_amount' => $totalAmount,
                    'order_status' => $sample['status'],
                    'payment_type' => $sample['payment_type'],
                    'payment_status' => $sample['payment_status'],
                    'payment_at' => $sample['payment_status'] === PaymentStatus::PAID->value ? now()->subDay() : null,
                    'delivered_at' => $sample['status'] === DeliveryStatus::DELIVERED->value ? now()->subDay() : null,
                    'completed_at' => null,
                    'voucher_discount_value' => 0,
                    'user_id' => $customer->id,
                    'is_confirmed' => $sample['is_confirmed'],
                ]
            );

            foreach ($sample['items'] as $item) {
                if (!isset($variants[$item['sku']], $products[$item['product']])) {
                    continue;
                }

                $variant = $variants[$item['sku']];
                $product = $products[$item['product']];
                $qty = $item['qty'];
                $linePrice = $variant->price * $qty;

                OrderItem::updateOrCreate(
                    [
                        'order_id' => $order->id,
                        'product_variant_id' => $variant->id,
                    ],
                    [
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'is_reviewed' => false,
                        'final_price' => $linePrice,
                        'list_price_snapShot' => $product->list_price,
                        'name_product_snapshot' => $product->name,
                        'url_image_snapShot' => $product->url_image_cover,
                        'variant_attributes_snapshot' => $item['attrs'],
                    ]
                );
            }
        }
    }
}
