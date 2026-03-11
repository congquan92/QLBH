<?php
namespace App\Http\States;

use App\Enums\DeliveryStatus;
use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use App\Http\States\CompleteState;
use App\Http\States\ConfirmedState;
use App\Http\States\DeliveredState;
use App\Http\States\OrderState;
use App\Http\States\PackedState;
use App\Http\States\PendingState;
use App\Http\States\ShippedState;

class OrderStateFactory {
    public static function getState(DeliveryStatus $status): OrderState {
        return match ($status) {
            DeliveryStatus::PENDING   => new PendingState(),
            DeliveryStatus::CONFIRMED => new ConfirmedState(),
            DeliveryStatus::PACKED    => new PackedState(),
            DeliveryStatus::SHIPPED   => new ShippedState(),
            DeliveryStatus::DELIVERED => new DeliveredState(),
            DeliveryStatus::COMPLETED => new CompleteState(),
            default => throw new BusinessException(ErrorCode::BAD_REQUEST,"Trạng thái không hợp lệ"),
        };
    }
}