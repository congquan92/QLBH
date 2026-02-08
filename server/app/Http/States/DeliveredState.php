<?php
namespace App\States;

use App\Exceptions\ErrorCode;
use App\Http\Service\FirebaseService;
use App\Models\Order;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\BusinessException;
use Carbon\Carbon;

class DeliveredState implements OrderState {
    public function changeState(Order $order, DeliveryStatus $nextStatus , FirebaseService $firebase): void {
        if ($nextStatus === DeliveryStatus::COMPLETED) {
            if (!$order->order_tracking_code) {
                throw new BusinessException(ErrorCode::BAD_REQUEST, "Đơn hàng chưa có mã vận đơn");
            }
            $order->payment_status = PaymentStatus::PAID;
            $order->completed_at = Carbon::now();
            $order->order_status = DeliveryStatus::COMPLETED;
        } else {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Chuyển đổi từ DELIVERED sang trạng thái không hợp lệ");
        }
    }
}