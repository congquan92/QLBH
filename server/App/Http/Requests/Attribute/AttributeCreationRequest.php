<?php

namespace App\Http\Requests\Attribute;

use Illuminate\Foundation\Http\FormRequest;

class AttributeCreationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            // Kiểm tra mảng attributes (Tương đương List<AttributeCreationRequest>)
            'attributes' => 'required|array|min:1',
            
            // Validate từng Attribute (Tương đương @NotBlank của AttributeCreationRequest.name)
            'attributes.*.name' => 'required|string|max:255',

            // Validate mảng con attributeValue (Tương đương @Valid List<AttributeValueCreationRequest>)
            'attributes.*.attributeValue' => 'required|array|min:1',
            
            // Validate từng giá trị bên trong (Tương đương @NotBlank của AttributeValueCreationRequest.value)
            'attributes.*.attributeValue.*.value' => 'required|string|max:255',
            'attributes.*.attributeValue.*.image' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'attributes.*.name.required' => 'Attribute name not blank',
            'attributes.*.attributeValue.*.value.required' => 'Attribute value not blank',
        ];
    }
}