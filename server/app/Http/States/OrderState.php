<?php
namespace App\States;

use App\Models\Order;

interface OrderState {
    public function changeState(Order $order, string $nextStatus): void;
}