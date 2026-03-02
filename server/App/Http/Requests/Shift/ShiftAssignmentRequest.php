<?php
namespace App\Http\Requests\Shift;

use Illuminate\Foundation\Http\FormRequest;

class ShiftAssignmentRequest extends FormRequest
{
    public function authorize() { return true; }
    public function rules() {
        return [
            'user_id' => 'required|exists:users,id',
            'shift_id' => 'required|exists:shifts,id',
            'date' => 'required|date|after_or_equal:today',
        ];
    }
    public function messages() {
        return [
            'user_id.exists' => 'Nhân viên không tồn tại.',
            'shift_id.exists' => 'Ca làm việc không hợp lệ.',
            'date.after_or_equal' => 'Không thể phân ca cho ngày trong quá khứ.',
        ];
    }
}