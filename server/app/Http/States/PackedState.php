<?php
namespace App\States;

use App\Exceptions\ErrorCode;
use App\Http\Service\FirebaseService;
use App\Models\Order;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\BusinessException;
use Carbon\Carbon;

class PackedState implements OrderState {
    public function changeState(Order $order, DeliveryStatus $nextStatus, FirebaseService $firebase): void {
        if ($nextStatus === DeliveryStatus::SHIPPED) {
            $order->order_status = DeliveryStatus::SHIPPED;
        } else {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Chuyển đổi từ DELIVERED sang trạng thái không hợp lệ");
        }
    }
}