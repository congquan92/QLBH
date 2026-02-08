<?php
namespace App\States;

use App\Exceptions\ErrorCode;
use App\Http\Service\FirebaseService;
use App\Models\Order;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Exceptions\BusinessException;

class PendingState implements OrderState {
    public function changeState(Order $order, DeliveryStatus $nextStatus ,FirebaseService $firebase): void {
        if ($order->payment_type === PaymentType::BANK_TRANSFER && 
            $order->payment_status === PaymentStatus::UNPAID) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Không thể chuyển trạng thái khi chưa thanh toán chuyển khoản");
        }

        if ($nextStatus === DeliveryStatus::CONFIRMED) {
            $order->order_status = $nextStatus;
            
        } else {
            throw new BusinessException(ErrorCode::BAD_REQUEST, "Chuyển đổi từ PENDING sang trạng thái không hợp lệ");
        }
    }
}