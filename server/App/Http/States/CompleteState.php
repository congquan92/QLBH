<?php
namespace App\Http\States;

use App\Exceptions\ErrorCode;
use App\Http\Service\FirebaseService;
use App\Models\Order;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\BusinessException;
use Carbon\Carbon;

class CompleteState implements OrderState {
    public function changeState(Order $order, DeliveryStatus $nextStatus, FirebaseService $firebase): void {
       throw new BusinessException(ErrorCode::BAD_REQUEST,"Chuyển đổi từ COMPLETED sang trạng thái không hợp lệ");
    }
}