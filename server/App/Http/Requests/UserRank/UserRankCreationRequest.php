<?php
namespace App\Http\Requests\UserRank;

use Illuminate\Foundation\Http\FormRequest;
class UserRankCreationRequest extends FormRequest{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => 'required|string|max:500',
            'min_spent' => 'required|numeric|gt:0|decimal:0,2'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'      => 'Mô tả voucher không được để trống.',
            'min_spent' => 'Mức chi tiêu tối thiểu không được để trống'
        ];
    }
}