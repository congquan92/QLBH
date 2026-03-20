<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        // Lấy các đơn đã giao thành công
        $deliveredOrders = DB::table('orders')
            ->where('order_status', 'DELIVERED')
            ->get();

        DB::transaction(function () use ($deliveredOrders): void {
            foreach ($deliveredOrders as $order) {
                $items = DB::table('order_items')->where('order_id', $order->id)->get();

                foreach ($items as $item) {
                    // Mỗi đơn có 70% xác suất được review (mô phỏng thực tế)
                    if (rand(1, 10) > 7) continue;

                    DB::table('reviews')->updateOrInsert(
                        ['order_item_id' => $item->id, 'user_id' => $order->user_id],
                        [
                            'product_id' => $item->product_id,
                            'rating'     => $this->randomRating(),
                            'comment'    => $this->randomComment(),
                            'updated_at' => now()->subDays(rand(1, 5)),
                            'created_at' => now()->subDays(rand(1, 5)),
                        ]
                    );

                    DB::table('order_items')->where('id', $item->id)
                        ->update(['is_reviewed' => true, 'updated_at' => now()]);
                }
            }

            // Cập nhật avg_rating cho từng sản phẩm
            $productIds = DB::table('reviews')->distinct()->pluck('product_id');
            foreach ($productIds as $productId) {
                $avg = (float) DB::table('reviews')->where('product_id', $productId)->avg('rating');
                DB::table('products')->where('id', $productId)
                    ->update(['avg_rating' => round($avg, 2), 'updated_at' => now()]);
            }
        });
    }

    private function randomRating(): float
    {
        return (float) array_rand([4.0 => 1, 4.5 => 1, 5.0 => 1]);
    }

    private function randomComment(): string
    {
        $comments = [
            'Sản phẩm đúng mô tả, chất lượng tốt, đóng gói cẩn thận.',
            'Mặc vào rất vừa vặn, vải mịn và thoáng mát. Sẽ mua lại.',
            'Giao hàng nhanh, shop tư vấn nhiệt tình. Hàng đẹp như hình.',
            'Chất liệu cao cấp hơn mình nghĩ, rất hài lòng.',
            'Màu sắc đẹp, form chuẩn. Bạn bè khen nhiều.',
            'Sản phẩm ok, ship hơi lâu nhưng chất lượng bù lại được.',
        ];

        return $comments[array_rand($comments)];
    }
}
