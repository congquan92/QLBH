<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ProductCreationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // phân quyền xử lý bằng middleware / gate
    }

    public function rules(): array
    {
        return [
            // ===== Basic info =====
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',

            'supplierId' => 'required|integer|exists:suppliers,id',

            // ===== Price =====
            'listPrice' => 'required|numeric|gt:0|decimal:0,2',
            'salePrice' => 'required|numeric|gt:0|decimal:0,2',

            // ===== Category =====
            'categoryId' => 'required|integer|exists:categories,id',

            // ===== Media =====
            'coverImage' => 'required|string',
            'imageProduct' => 'required|array|min:1',
            'imageProduct.*' => 'required|string',

            'video' => 'nullable|string',

            // ===== Variants =====
            'productVariant' => 'nullable|array',
            'productVariant.*.price' => 'required|numeric|gt:0',
            'productVariant.*.height' => 'required|numeric|gt:0',
            'productVariant.*.length' => 'required|numeric|gt:0',
            'productVariant.*.width' => 'required|numeric|gt:0',
            'productVariant.*.weight' => 'required|numeric|gt:0',

            // ===== Attributes =====
            'attributes' => 'nullable|array',
            'attributes.*.name' => 'required|string|max:255',
            'attributes.*.attributeValue.*.image' => 'nullable|string',

            // ===== Shipping info =====
            'weight' => 'nullable|integer|min:0',
            'length' => 'nullable|integer|min:0',
            'width'  => 'nullable|integer|min:0',
            'height' => 'nullable|integer|min:0',
        ];
    }

    /**
     * Tương đương @AssertTrue trong Java
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $listPrice = $this->input('listPrice');
            $salePrice = $this->input('salePrice');

            if ($listPrice !== null && $salePrice !== null) {
                if ($listPrice < $salePrice) {
                    $validator->errors()->add(
                        'listPrice',
                        'List price must be greater than or equal to sale price'
                    );
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required',
            'listPrice.gt' => 'Origin price must be greater than 0',
            'salePrice.gt' => 'Sale price must be greater than 0',
            'categoryId.required' => 'Category is required',
            'categoryId.exists' => 'Category not found',
            'coverImage.required' => 'Cover image is required',
            'imageProduct.min' => 'At least 1 product image is required',
        ];
    }
}
