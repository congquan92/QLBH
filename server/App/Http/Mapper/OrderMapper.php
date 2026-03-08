<?php

namespace App\Http\Mapper;

use App\Http\Responses\Order\OrderResponse;
use App\Models\Order;
use App\Http\Mapper\UserMapper;
use App\Http\Mapper\OrderItemMapper;
use JsonSerializable;

class OrderMapper implements JsonSerializable
{
    public static function toOrderResponse(Order $order): OrderResponse
    {
        return new OrderResponse(
            id: $order->id,
            userResponse: UserMapper::toUserResponse($order->user),
            customerName: $order->customer_name,
            customerPhone: $order->customer_phone,
            deliveryWardName: $order->delivery_ward_name,
            deliveryDistrictId: $order->delivery_district_id,
            deliveryProvinceId: $order->delivery_province_id,
            deliveryDistrictName: $order->delivery_district_name,
            deliveryProvinceName: $order->delivery_province_name,
            deliveryWardCode: $order->delivery_ward_code,
            deliveryAddress: $order->delivery_address,
            totalAmount: (float) $order->total_amount,
            note: $order->note,
            isConfirmed: (bool) $order->is_confirmed,
            totalFeeShip: (float) $order->total_fee_ship,
            discountValue: (float) $order->voucher_discount_value,
            originalOrderAmount: (float) $order->original_order_amount,
            deliveryStatus: $order->order_status->value,
            paymentStatus: $order->payment_status->value,
            paymentType: $order->payment_type->value,
            orderTrackingCode: $order->order_tracking_code,
            createdAt: $order->created_at,
            updatedAt: $order->updated_at,
            voucherResponse: $order->voucherUsage && $order->voucherUsage->voucher
            ? VoucherMapper::toVoucherResponse($order->voucherUsage->voucher)
            : null,
            orderItemResponses: $order->orderItem->map(function ($item) {
                return OrderItemMapper::toOrderItemResponse($item);
            })->toArray()
        );
    }
    public function jsonSerialize(): mixed
    {
        return get_object_vars($this);
    }
}