<?php
namespace App\Http\States;

use App\Exceptions\ErrorCode;
use App\Http\Mapper\OrderMapper;
use App\Http\Service\FirebaseService;
use App\Http\Service\GhnService;
use App\Models\Order;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Exceptions\BusinessException;
use Carbon\Carbon;

class ShippedState implements OrderState
{
    public function changeState(Order $order, DeliveryStatus $nextStatus, FirebaseService $firebase): void
    {
        $ghnService = app(GhnService::class);
        if ($nextStatus === DeliveryStatus::DELIVERED) {
            $order->order_status = DeliveryStatus::DELIVERED;
            $order->delivered_at = Carbon::now();
            $ghnService->createShippingOrder($order);
            $orderResponse = OrderMapper::toOrderResponse($order);
            $firebase->sendNotification("user_{$order->user_id}", [
                'title' => '🚚 Đơn hàng đang giao',
                'body' => "Đơn hàng #{$order->id} của bạn đã được bàn giao cho đơn vị vận chuyển.",
                'order_id' => $order->id,
                'type' => 'order_status',
                'order_data' => json_encode($orderResponse),
            ]);

        } else {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Chuyển đổi từ DELIVERED sang trạng thái không hợp lệ");
        }
    }
}