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
            'description'       => 'required|string|max:500',
            'type'              => 'required|string', // Ví dụ: FIXED, PERCENTAGE
            'discountValue'     => 'required|numeric|min:0',
            'maxDiscountValue'  => 'nullable|numeric|min:0',
            'minDiscountValue'  => 'nullable|numeric|min:0',
            'totalQuantity'     => 'required|integer|min:1',
            'startDate'         => 'required|date|after_or_equal:today',
            'endDate'           => 'required|date|after:startDate',
            'usageLimitPerUser' => 'nullable|integer|min:1',
            'userRankId'        => 'required|exists:user_ranks,id',
            'isShipping'        => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'description.required'      => 'Mô tả voucher không được để trống.',
            'type.required'             => 'Loại voucher không được để trống.',
            'discountValue.required'    => 'Giá trị giảm giá không được để trống.',
            'discountValue.numeric'     => 'Giá trị giảm giá phải là số.',
            'totalQuantity.required'    => 'Số lượng voucher không được để trống.',
            'totalQuantity.min'         => 'Số lượng phải ít nhất là 1.',
            'startDate.required'        => 'Ngày bắt đầu không được để trống.',
            'startDate.after_or_equal'  => 'Ngày bắt đầu phải tính từ ngày hôm nay.',
            'endDate.required'          => 'Ngày kết thúc không được để trống.',
            'endDate.after'             => 'Ngày kết thúc phải sau ngày bắt đầu.',
            'userRankId.required'       => 'Hạng người dùng không được để trống.',
            'userRankId.exists'         => 'Hạng người dùng không tồn tại trong hệ thống.',
            'isShipping.required'       => 'Vui lòng xác định voucher có áp dụng cho vận chuyển không.',
        ];
    }
}