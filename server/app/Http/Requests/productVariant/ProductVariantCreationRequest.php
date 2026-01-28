<?php

namespace App\Http\Requests\ProductVariant;

use Illuminate\Foundation\Http\FormRequest;

class ProductVariantCreationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'productId' => 'nullable|integer|exists:products,id',
            
            // @NotNull + @Positive tương đương 'required|integer|gt:0'
            'weight' => 'required|integer|gt:0',
            'length' => 'required|integer|gt:0',
            'width'  => 'required|integer|gt:0',
            'height' => 'required|integer|gt:0',
            
            'price'    => 'required|numeric|min:0',

            // @Valid List<VariantAttributeRequest>
            'variantAttributes' => 'nullable|array',
            'variantAttributes.*.attribute' => 'required|string|max:255',
            'variantAttributes.*.value'     => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'weight.required' => 'Weight must not be null',
            'weight.gt'       => 'Weight must be greater than 0',
            'length.required' => 'Length must not be null',
            'length.gt'       => 'Length must be greater than 0',
            'width.required'  => 'Width must not be null',
            'width.gt'        => 'Width must be greater than 0',
            'height.required' => 'Height must not be null',
            'height.gt'       => 'Height must be greater than 0',
            'variantAttributes.*.attribute.required' => 'Attribute name not blank',
            'variantAttributes.*.value.required'     => 'Attribute value not blank',
        ];
    }
}