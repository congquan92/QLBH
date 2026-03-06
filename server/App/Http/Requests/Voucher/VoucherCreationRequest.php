<?php

namespace App\Http\Requests\Voucher;

use Illuminate\Foundation\Http\FormRequest;

class VoucherCreationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

   public function rules(): array
{
    return [
        'description'        => 'required|string|max:500',
        'type'               => 'required|string', 
        'discount_value'     => 'required|numeric|min:0', // Đổi sang snake_case
        'max_discount_value' => 'nullable|numeric|min:0',
        'min_discount_value' => 'nullable|numeric|min:0',
        'total_quantity'     => 'required|integer|min:1',
        'start_date'         => 'required|date|after_or_equal:today',
        'end_date'           => 'required|date|after:start_date', // Sửa lại theo tên mới
        'usage_limit_per_user' => 'nullable|integer|min:1',
        'user_rank_id'       => 'required|exists:user_ranks,id',
        'is_shipping'        => 'required|boolean',
    ];
}
   public function messages(): array
    {
        return [
            'description.required'        => 'Mô tả voucher không được để trống.',
            'type.required'               => 'Loại voucher không được để trống.',
            'discount_value.required'     => 'Giá trị giảm giá không được để trống.',
            'discount_value.numeric'      => 'Giá trị giảm giá phải là số.',
            'total_quantity.required'     => 'Số lượng voucher không được để trống.',
            'total_quantity.min'          => 'Số lượng phải ít nhất là 1.',
            'start_date.required'         => 'Ngày bắt đầu không được để trống.',
            'start_date.after_or_equal'   => 'Ngày bắt đầu phải tính từ ngày hôm nay.',
            'end_date.required'           => 'Ngày kết thúc không được để trống.',
            'end_date.after'              => 'Ngày kết thúc phải sau ngày bắt đầu.',
            'user_rank_id.required'       => 'Hạng người dùng không được để trống.',
            'user_rank_id.exists'         => 'Hạng người dùng không tồn tại trong hệ thống.',
            'is_shipping.required'        => 'Vui lòng xác định voucher có áp dụng cho vận chuyển không.',
        ];
    }
}