<?php

namespace App\Http\Requests\User;

use App\Exceptions\MessageError;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UserPasswordRequest extends FormRequest
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
            'oldPassword' => 'required|string|max:255',
            'password' => ['required', 'string', 'min:8'],
            'confirmPassword' => ['required', 'string', 'min:8'],
        ];
    }

    public function messages(): array
    {
        return [
            'password.min' => 'Mật khẩu phải ít nhất 8 kí tự !',
            'confirmPassword.min' => 'Mật khẩu phải ít nhất 8 kí tự !',
            'oldPassword.required' => 'Mật khẩu cũ không được trống !',
            'password.required' => 'Mật khẩu không được để trống !',
            'confirmPassword.required' => 'Mật khẩu không được để trống !',
        ];
    }
}
