<?php
namespace App\States;

use App\Exceptions\ErrorCode;
use App\Models\Order;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Exceptions\BusinessException;
use Carbon\Carbon;

class ShippedState implements OrderState
{
    public function changeState(Order $order, string $nextStatus): void
    {
        if ($nextStatus === DeliveryStatus::DELIVERED) {
            if ($order->order_tracking_code == null) {
                throw new BusinessException(ErrorCode::BAD_REQUEST, "Chưa bàn giao cho đơn vị vận chuyển!");
            }
            $order->order_status = DeliveryStatus::DELIVERED;
            $order->delivered_at = Carbon::now();
        } else {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Chuyển đổi từ DELIVERED sang $nextStatus không hợp lệ");
        }
    }
}