<?php
namespace App\Http\Requests\ReviewProduct;

use Illuminate\Foundation\Http\FormRequest;
class ReviewCreationRequest extends FormRequest{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_item_id' => 'required|exists:order_items,id', 
            'rating'        => 'required|integer|min:1|max:5',  
            'comment'       => 'nullable|string|max:1000',      
            'image_url'     => 'nullable|array',              
            'image_url.*'   => 'string'                
        ];
    }

    public function messages(): array
    {
        return [
            'order_item_id.required' => 'Mã mục đơn hàng không được để trống.',
            'order_item_id.exists'   => 'Mục đơn hàng không tồn tại.',
            'rating.required'        => 'Số sao đánh giá không được để trống.',
            'rating.integer'         => 'Số sao phải là số nguyên.',
            'rating.min'             => 'Đánh giá tối thiểu là 1 sao.',
            'rating.max'             => 'Đánh giá tối đa là 5 sao.',
            'comment.max'            => 'Bình luận không được vượt quá 1000 ký tự.',
            'image_url.array'        => 'Danh sách hình ảnh phải là một mảng.',
        ];
    }
}