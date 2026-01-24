<?php

namespace App\Http\Requests;

use App\Enums\PaymentType; // Import Enum của bạn
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductPackage extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nameProduct'          => 'required|string|max:255',
            'length'         => 'required|integer',
            'width'     => 'required|integer',
            'height'     => 'required|integer',
            'weight'   => 'required|integer',
            'quantity'   => 'required|integer',
        ];
    }
    public function messages(): array
    {
        return [
            'nameProduct.required' => 'Product name must be not blank',
            'length.required' => 'Length is required',
            'width.regex' => 'Width is required',
            'height.required' => 'Height is required',
            'weight.required' => 'Weight is required',
            'quantity.required' => 'Quantity is required',
        ];
    }
}