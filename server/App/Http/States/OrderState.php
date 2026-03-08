<?php
namespace App\Http\States;

use App\Enums\DeliveryStatus;
use App\Http\Service\FirebaseService;
use App\Models\Order;

interface OrderState {
    public function changeState(Order $order, DeliveryStatus $nextStatus ,FirebaseService $firebase): void;

}