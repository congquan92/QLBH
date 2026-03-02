<?php
namespace App\Http\Requests\Salary;
use Illuminate\Foundation\Http\FormRequest;

class SalaryConfigCreationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [
            'configs' => 'required|array|min:1',
            'configs.*.rule_name' => 'required|string|max:255',
            'configs.*.employee_type' => 'required|string',
            'configs.*.multiplier' => 'required|decimal:0,2|gt:0',
            'configs.*.is_holiday' => 'required|boolean',
        ];
    }
    public function messages(): array
    {
        return [
            'configs.*.rule_name.required' => 'Tên không được để trống !',
            'configs.*.employee_type.required' => 'Loại nhân viên không được để trống !',
            'configs.*.multiplier.required' => 'Hệ số lương không được để trống !',
            'configs.*.multiplier.gt'      => 'Hệ số lương phải lớn hơn 0!',
            'configs.*.is_holiday.required' => 'Lễ không được để trống !',
        ];
    }
}