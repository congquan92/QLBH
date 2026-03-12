<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReviewDemoSeeder extends Seeder
{
    public function run(): void
    {
        $customerId = DB::table('users')->where('username', 'customer_demo')->value('id');
        $orderId = DB::table('orders')->where('order_tracking_code', 'DEMO-ORDER-1002')->value('id');

        if (!$customerId || !$orderId) {
            return;
        }

        DB::transaction(function () use ($customerId, $orderId): void {
            $items = DB::table('order_items')->where('order_id', $orderId)->get();

            foreach ($items as $item) {
                DB::table('reviews')->updateOrInsert(
                    ['order_item_id' => $item->id, 'user_id' => $customerId],
                    [
                        'product_id' => $item->product_id,
                        'rating' => 4.5,
                        'comment' => 'San pham demo tot, dung nhu mo ta.',
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );

                $reviewId = DB::table('reviews')->where('order_item_id', $item->id)->where('user_id', $customerId)->value('id');
                if ($reviewId) {
                    DB::table('image_reviews')->updateOrInsert(
                        ['review_id' => $reviewId, 'url_image' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80'],
                        ['updated_at' => now(), 'created_at' => now()]
                    );
                }

                DB::table('order_items')->where('id', $item->id)->update([
                    'is_reviewed' => true,
                    'updated_at' => now(),
                ]);
            }
        });
    }
}
