<?php
namespace App\States;

use App\Exceptions\ErrorCode;
use App\Http\Service\FirebaseService;
use App\Models\Order;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\BusinessException;
use Carbon\Carbon;

class ConfirmedState implements OrderState
{
    public function changeState(Order $order, DeliveryStatus $nextStatus, FirebaseService $firebase): void
    {
        if ($nextStatus === DeliveryStatus::PACKED) {
            $order->order_status = DeliveryStatus::PACKED;
            $firebase->sendNotification("user_{$order->user_id}", [
                'title' => '📦 Đang đóng gói',
                'body' => "Người bán đang chuẩn bị và đóng gói đơn hàng #{$order->id} của bạn.",
                'order_id' => $order->id,
                'type' => 'order_status'
            ]);
        } else {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Chuyển đổi từ DELIVERED sang trạng thái không hợp lệ");
        }
    }
}