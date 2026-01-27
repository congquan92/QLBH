<?php

namespace App\Http\Requests\Orders;

use App\Enums\PaymentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderCreationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customerName'          => 'required|string|max:255',
            'customerPhone'         => ['required', 'regex:/^(0[0-9]{9}|\+84[0-9]{9})$/'],
            'deliveryWardName'     => 'required|string',
            'deliveryWardCode'     => 'required|string',
            'deliveryDistrictId'   => 'required|integer',
            'deliveryProvinceId'   => 'required|integer',
            'deliveryDistrictName' => 'required|string',
            'deliveryProvinceName' => 'required|string',
            'deliveryAddress'       => 'required|string',
            'order_items'            => 'required|array|min:1',
            'order_items.*.productVariantId' => 'required|integer|exists:product_variants,id',
            'order_items.*.quantity' => 'required|integer|min:1',
            'paymentType'           => ['required', Rule::enum(PaymentType::class)],
            'point'                  => 'nullable|integer|min:0',
            'note'                   => 'nullable|string|max:500',
            'voucherId'             => 'nullable|integer',
        ];
    }
    public function messages(): array
    {
        return [
            'customerName.required' => 'Customer name must be not blank',
            'customerPhone.required' => 'Phone number is required',
            'customerPhone.regex' => 'Phone number is invalid',
            'order_items.required' => 'Order items must be not null',
            'paymetType.required' => 'Payment type is required',
            'deliveryWardName.required' => 'Delivery ward name must be not blank',
            'deliveryWardCode.required'=> 'Delivery ward code must be not blank',
            'deliveryDistrictId.required'=> 'Delivery district id must be not blank',
            'deliveryProvinceId.required'=> 'Delivery province id must be not blank',
            'deliveryDistrictName.required'=> 'Delivery district name must be not blank',
            'deliveryProvinceName.required'=> 'Delivery province name must be not blank',
        ];
    }
}