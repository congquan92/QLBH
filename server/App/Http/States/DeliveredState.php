<?php
namespace App\Http\States;

use App\Exceptions\ErrorCode;
use App\Http\Mapper\OrderMapper;
use App\Http\Service\FirebaseService;
use App\Models\Order;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\BusinessException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DeliveredState implements OrderState
{
    public function changeState(Order $order, DeliveryStatus $nextStatus, FirebaseService $firebase): void
    {
        if ($nextStatus === DeliveryStatus::COMPLETED) {
            if (!$order->order_tracking_code) {
                throw new BusinessException(ErrorCode::BAD_REQUEST, "Đơn hàng chưa có mã vận đơn");
            }
            $order->payment_status = PaymentStatus::PAID;
            $order->completed_at = Carbon::now();
            $order->order_status = DeliveryStatus::COMPLETED;
            $orderResponse = OrderMapper::toOrderResponse($order);
           Log::info("res: " . json_encode($orderResponse));
            $firebase->sendNotification("user_{$order->user_id}", [
                'title' => '🎉 Đơn hàng hoàn tất',
                'body' => "Cảm ơn bạn đã mua sắm! Đơn hàng #{$order->id} đã được hoàn tất.",
                'order_id' => $order->id,
                'type' => 'order_status',
                'order_data' => json_encode($orderResponse),
            ]);
        } else {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Chuyển đổi từ DELIVERED sang trạng thái không hợp lệ");
        }
    }
}