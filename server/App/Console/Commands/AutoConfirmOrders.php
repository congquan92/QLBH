<?php
namespace App\Console\Commands;

use App\Http\Service\UserService;
use Illuminate\Console\Command;
use App\Models\Order;
use App\Enums\DeliveryStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AutoConfirmOrders extends Command
{
    protected $signature = 'orders:auto-confirm';
    protected $description = 'Tự động xác nhận đơn hàng sau 7 ngày giao hàng thành công';

    public function handle()
    {
        $sevenDaysAgo = now()->subDays(7);

        $orders = Order::where('order_status', DeliveryStatus::DELIVERED)
                    ->where('delivered_at', '<', $sevenDaysAgo)
                    ->get();

        if ($orders->isEmpty()) {
            $this->info("Không có đơn hàng nào cần xác nhận.");
            return;
        }

        foreach ($orders as $order) {
            DB::transaction(function () use ($order) {
                try {
                    /** @var Order $order */
                    $order->order_status = DeliveryStatus::COMPLETED;
                    $order->completed_at = now();
                    
                    $user = $order->user;
                    if ($user) {
                        $user->total_spent += $order->total_amount;
                        $user->save();
                        
                        // Cập nhật Rank
                        app(UserService::class)->updateRank($user);
                    }

                    $order->save();
                    
                    
                    Log::info("Auto confirmed order ID: {$order->id}");
                } catch (\Exception $e) {
                    Log::error("Error auto confirming order {$order->id}: " . $e->getMessage());
                }
            });
        }

        $this->info("Đã xử lý xong " . $orders->count() . " đơn hàng.");
    }
}