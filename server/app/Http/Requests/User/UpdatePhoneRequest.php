<?php

namespace App\Http\Requests\User;

use App\Exceptions\MessageError;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdatePhoneRequest extends FormRequest
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
            'new_phone' => [
                'required',
                'string',
                'regex:/^(0[0-9]{9}|\+84[0-9]{9})$/',
            ],
            'otp' => 'required|string|min:6|max:6',
        ];
    }

    public function messages(): array
    {
        return [
            'otp' => 'required|string|min:6|max:6',
            'new_phone.regex' => 'Số điện thoại không đúng định dạng!',
        ];
    }
}
