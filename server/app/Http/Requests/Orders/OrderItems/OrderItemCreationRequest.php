<?php

namespace App\Http\Requests\Orders\OrderItems;

use App\Enums\PaymentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderItemCreationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'productVariantId' => 'required|integer|exists:product_variants,id',
            'quantity'           => 'required|integer|min:1',
        ];
    }
    public function messages(): array
    {
        return [
            'productVariantId.required' => 'Product variant is required',
            'quantity.required' => 'Quantity is required',
        ];
    }
}