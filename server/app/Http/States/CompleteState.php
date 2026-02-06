<?php
namespace App\States;

use App\Exceptions\ErrorCode;
use App\Models\Order;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\BusinessException;
use Carbon\Carbon;

class CompleteState implements OrderState {
    public function changeState(Order $order, string $nextStatus): void {
       throw new BusinessException(ErrorCode::BAD_REQUEST,"Chuyển đổi từ COMPLETED sang $nextStatus không hợp lệ");
    }
}