<?php

namespace App\Http\Requests\VariantAttribute;

use Illuminate\Foundation\Http\FormRequest;

class VariantAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // @NotBlank tương đương 'required|string'
            'attribute' => 'required|string|max:255',
            'value'     => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'attribute.required' => 'Attribute name not blank',
            'value.required'     => 'Attribute value not blank',
        ];
    }
}