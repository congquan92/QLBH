<?php
namespace App\State;

use App\Enums\DeliveryStatus;
use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use App\States\CompleteState;
use App\States\ConfirmedState;
use App\States\DeliveredState;
use App\States\OrderState;
use App\States\PackedState;
use App\States\PendingState;
use App\States\ShippedState;

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