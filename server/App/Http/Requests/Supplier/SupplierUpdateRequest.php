<?php

namespace App\Http\Requests\Supplier;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SupplierUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string|max:255',
            'province' => 'sometimes|required|string',
            'district' => 'sometimes|required|string',
            'ward' => 'sometimes|required|string',
            'provinceId' => 'sometimes|required|integer',
            'districtId' => 'sometimes|required|integer',
            'wardId' => 'sometimes|required|integer',
            'phone' => [
                'sometimes',
                'required',
                'regex:/^(0[0-9]{9}|\+84[0-9]{9})$/',
            ],
            'status' => 'sometimes|required|in:ACTIVE,INACTIVE,DISABLED',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $locationKeys = [
                'province',
                'district',
                'ward',
                'provinceId',
                'districtId',
                'wardId',
            ];

            $hasAnyLocationField = false;
            foreach ($locationKeys as $key) {
                if ($this->has($key)) {
                    $hasAnyLocationField = true;
                    break;
                }
            }

            if (!$hasAnyLocationField) {
                return;
            }

            foreach ($locationKeys as $key) {
                $value = $this->input($key);
                if ($value === null || (is_string($value) && trim($value) === '')) {
                    $validator->errors()->add($key, 'Bộ dữ liệu địa chỉ phải gồm đủ province/district/ward và provinceId/districtId/wardId.');
                }
            }
        });
    }
}
