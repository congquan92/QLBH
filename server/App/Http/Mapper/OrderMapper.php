<?php

namespace App\Http\Mapper;

use App\Http\Responses\Order\OrderResponse;
use App\Models\Order;
use App\Http\Mapper\UserMapper;
use App\Http\Mapper\OrderItemMapper;

class OrderMapper
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
            discountValue: (float) $order->discount_value,
            originalOrderAmount: (float) $order->original_order_amount,
            deliveryStatus: $order->delivery_status, 
            paymentStatus: $order->payment_status,  
            paymentType: $order->payment_type,   
            orderTrackingCode: $order->order_tracking_code,
            createdAt: $order->created_at, 
            updatedAt: $order->updated_at,
            orderItemResponses: $order->orderItems->map(function ($item) {
                return OrderItemMapper::toOrderItemResponse($item);
            })->toArray()
        );
    }
}