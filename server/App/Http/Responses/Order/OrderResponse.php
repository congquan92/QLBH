<?php

namespace App\Http\Responses\Order;

use App\Http\Responses\User\UserResponse;
use App\Http\Responses\Voucher\VoucherResponse;
use Carbon\Carbon;

class OrderResponse {
    public function __construct(
        public int $id,
        public ?UserResponse $userResponse,
        public ?string $customerName,
        public ?string $customerPhone,
        public ?string $deliveryWardName,
        public ?int $deliveryDistrictId,
        public ?int $deliveryProvinceId,
        public ?string $deliveryDistrictName,
        public ?string $deliveryProvinceName,
        public ?string $deliveryWardCode,
        public ?string $deliveryAddress,
        public ?float $totalAmount,
        public ?string $note,
        public ?bool $isConfirmed,
        public ?float $totalFeeShip,
        public ?float $discountValue,
        public ?float $originalOrderAmount,
        public ?string $deliveryStatus, 
        public ?string $paymentStatus,  
        public ?string $paymentType,   
        public ?string $orderTrackingCode,
        public ?string $createdAt, 
        public ?string $updatedAt,
        public ?VoucherResponse $voucherResponse,
        /** @var OrderItemResponse[] */
        public array $orderItemResponses
    ) {}
}