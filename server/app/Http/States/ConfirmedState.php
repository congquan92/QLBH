<?php
namespace App\States;

use App\Exceptions\ErrorCode;
use App\Models\Order;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\BusinessException;
use Carbon\Carbon;

class ConfirmedState implements OrderState {
    public function changeState(Order $order, string $nextStatus): void {
        if ($nextStatus === DeliveryStatus::PACKED) {
            $order->order_status = DeliveryStatus::PACKED;
        } else {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Chuyển đổi từ DELIVERED sang $nextStatus không hợp lệ");
        }
    }
}