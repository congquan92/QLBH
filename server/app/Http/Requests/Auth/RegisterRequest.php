<?php

namespace App\Http\Requests\Auth;

use App\Exceptions\MessageError;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
            'fullName' => 'required|string|max:255',
            'gender' => 'required|in:MALE,FEMALE,OTHER',
            'dateOfBirth' => 'required|date',
            'email' => 'required|email',
            'phone' => [
                'required',
                'string',
                'regex:/^(0[0-9]{9}|\+84[0-9]{9})$/',
            ],
            'username' => 'required|string|max:100|unique:users,username',
            'password' => ['required', 'string', 'min:8'],
        ];
    }

    public function messages(): array
    {
        return [
             'password.min' => 'Mật khẩu phải ít nhất 8 kí tự !',
            'fullName.required' => MessageError::FULLNAME_NOT_BLANK,
            'gender.required' => MessageError::GENDER_NOT_BLANK,
            'gender.in' => 'Gender must be MALE, FEMALE, or OTHER',
            'dateOfBirth.required' => 'Date of birth must be not blank',
            'email.required' => MessageError::EMAIL_NOT_BLANK,
            'email.email' => 'Invalid email',
            'email.unique' => 'Email already exists',
            'phone.required' => MessageError::PHONE_NOT_BLANK,
            'phone.regex' => 'Phone number is invalid',
            'username.required' => MessageError::USERNAME_NOT_BLANK,
            'username.unique' => MessageError::USERNAME_EXISTED,
            'password.required' => MessageError::PASSWORD_NOT_BLANK,
        ];
    }
}
