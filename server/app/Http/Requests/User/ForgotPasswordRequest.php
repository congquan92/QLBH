<?php

namespace App\Http\Requests\User;

use App\Exceptions\MessageError;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ForgotPasswordRequest extends FormRequest
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
            'userId' => 'required|int',
            'sendEmail' => 'required|boolean',
            'password' => ['required', 'string', 'min:8'],
            'confirmPassword' => ['required', 'string', 'min:8'],
            'otp' => 'required|string|min:6|max:6',
        ];
    }

    public function messages(): array
    {
        return [
            'otp' => 'required|string|min:6|max:6',
            'sendEmail.required' => 'Vui lòng chọn phương thức gửi OTP!',
            'password.min' => 'Mật khẩu phải ít nhất 8 kí tự !',
            'confirmPassword.min' => 'Mật khẩu phải ít nhất 8 kí tự !',
            'userId.required' => 'Vui lòng chọn người dùng !',
            'password.required' => 'Mật khẩu không được để trống !',
            'confirmPassword.required' => 'Mật khẩu không được để trống !',
        ];
    }
}
