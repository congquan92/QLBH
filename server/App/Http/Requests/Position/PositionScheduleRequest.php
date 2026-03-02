<?php
namespace App\Http\Requests\Position;

use Illuminate\Foundation\Http\FormRequest;

class PositionScheduleRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules() {
        return [
            'schedules' => 'required|array|min:1',
            'schedules.*.day_of_week' => 'required|integer|between:0,6',
            'schedules.*.shift_id' => 'required|exists:shifts,id',
        ];
    }

    public function messages() {
        return [
            'schedules.required' => 'Bạn phải cung cấp ít nhất một ngày làm việc.',
            'schedules.*.day_of_week.between' => 'Thứ trong tuần phải từ 0 (CN) đến 6 (T7).',
            'schedules.*.shift_id.exists' => 'Ca làm việc không tồn tại trong hệ thống.',
        ];
    }
}