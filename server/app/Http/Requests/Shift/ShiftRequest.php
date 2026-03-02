<?php 
namespace App\Http\Requests\Shift;

use Illuminate\Foundation\Http\FormRequest;

class ShiftRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules() {
        return [
            'name' => 'required|string|max:100',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'grace_period' => 'integer|min:0'
        ];
    }

    public function messages() {
        return [
            'name.required' => 'Tên ca làm việc không được để trống.',
            'start_time.required' => 'Giờ bắt đầu không được để trống.',
            'end_time.after' => 'Giờ kết thúc phải sau giờ bắt đầu.',
            'grace_period.integer' => 'Thời gian ân hạn phải là số phút.'
        ];
    }
}