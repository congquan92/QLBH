<?php

namespace App\Http\Requests\Address;

use App\Exceptions\MessageError;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UserUpdateAddressRequest extends FormRequest
{
    // Cho phép tất cả user gửi request
    public function authorize(): bool
    {
        return true;
    }

    // Rules validate
    public function rules(): array
    {
        return [
            'address' => 'nullable|string',
            'customer_name' => 'nullable|string',
            'phone' => [
                'nullable',
                'string',
                'regex:/^(0[0-9]{9}|\+84[0-9]{9})$/',
            ],
            'province' => 'nullable|string',
            'district' => 'nullable|string',
            'ward' => 'nullable|string',
            'province_id' => 'nullable|int',
            'district_id' => 'nullable|int',
            'ward_id' => 'nullable|int',
            'address_type' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Số điện thoại không hợp lệ !',
        ];
    }
}
