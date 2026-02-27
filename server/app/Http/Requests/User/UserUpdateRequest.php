<?php

namespace App\Http\Requests\User;

use App\Exceptions\MessageError;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UserUpdateRequest extends FormRequest
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
            'fullName' => 'nullable|string|max:255',
            'gender' => 'required|in:MALE,FEMALE,OTHER',
            'dateOfBirth' => 'required|date',
            'email' => 'required|email',
            'avatar' => 'required|string',
            'status'=>'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'fullName.required' => MessageError::FULLNAME_NOT_BLANK,
            'gender.required' => MessageError::GENDER_NOT_BLANK,
            'gender.in' => 'Gender must be MALE, FEMALE, or OTHER',
            'dateOfBirth.required' => 'Date of birth must be not blank',
            'email.required' => MessageError::EMAIL_NOT_BLANK,
            'email.email' => 'Invalid email',
            'email.unique' => 'Email already exists',
            'username.required' => MessageError::USERNAME_NOT_BLANK,
            'username.unique' => MessageError::USERNAME_EXISTED,
            'password.required' => MessageError::PASSWORD_NOT_BLANK,
        ];
    }
}
