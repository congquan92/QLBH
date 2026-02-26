<?php
namespace App\Http\Requests\SalaryScale;

use Illuminate\Foundation\Http\FormRequest;

class SalaryScaleRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'years_of_experience' => 'required|integer|min:0',
            'coefficient' => 'required|numeric|min:1',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Tên thang lương không được để trống.',
            'years_of_experience.required' => 'Số năm kinh nghiệm không được để trống.',
            'coefficient.required' => 'Hệ số lương phải được nhập.',
            'coefficient.numeric' => 'Hệ số lương phải là con số.',
            'coefficient.min' => 'Hệ số lương tối thiểu phải là 1.0.'
        ];
    }
}