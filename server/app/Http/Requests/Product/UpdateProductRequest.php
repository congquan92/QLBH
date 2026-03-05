<?php

namespace App\Http\Requests\Product;

use App\Enums\Status;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // phân quyền xử lý bằng middleware / gate
    }

    public function rules(): array
    {
        return [
            // ===== Basic info =====
            'id' => 'required|integer',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'supplierId' => 'nullable|integer|exists:suppliers,id',
            'status' => ['nullable', Rule::enum(Status::class)],
            // ===== Price =====
            'listPrice' => 'nullable|numeric|gt:0|decimal:0,2',
            'salePrice' => 'nullable|numeric|gt:0|decimal:0,2',

            // ===== Category =====
            'categoryId' => 'nullable|integer|exists:categories,id',

            // ===== Media =====
            'coverImage' => 'nullable|string',
            'video' => 'nullable|string',

            'removeVideo' => 'nullable|boolean',
            'removeCoverImage' => 'nullable|boolean'
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
            'id.required' => 'Id not blank',
            'listPrice.gt' => 'Origin price must be greater than 0',
            'salePrice.gt' => 'Sale price must be greater than 0',
            'categoryId.exists' => 'Category not found',
            'supplierId.exists' => 'Supplier not found'
        ];
    }
}
