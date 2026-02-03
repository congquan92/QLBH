<?php

namespace App\Http\Requests\Address;

use App\Exceptions\MessageError;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UserCreationAddressRequest extends FormRequest
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
            'address' => 'required|string',
            'customer_name' => 'required|string',
            'phone' => [
                'required',
                'string',
                'regex:/^(0[0-9]{9}|\+84[0-9]{9})$/',
            ],
            'province' => 'required|string',
            'district' => 'required|string',
            'ward' => 'required|string',
            'province_id' => 'required|int',
            'district_id' => 'required|int',
            'ward_id' => 'required|int',
            'address_type' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'address.required' => 'Địa chỉ không được để trống !',
            'customer_name.required' => 'Tên khách hàng không được để trống !',
            'province.required' => 'Thành phố không được để trống !',
            'district.required' => 'Tên khách hàng không được để trống !',
            'ward.required' => 'Tên khách hàng không được để trống !',
            'province_id.required' => 'Thành phố không được để trống !',
            'district_id.required' => 'Id quận không được để trống !',
            'ward_id.required' => 'Id phường không được để trống !',
            'address_type.required' => 'Loại địa chỉ không được để trống !',
            'phone.required' => MessageError::PHONE_NOT_BLANK,
            'phone.regex' => 'Số điện thoại không hợp lệ !',
    
        ];
    }
}
