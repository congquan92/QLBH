<?php

namespace App\Models;

use App\Enums\Status;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'quantity',
        'user_id',
        'product_variant_id',
        'status',
        'list_price_snapshot',
        'url_image_snapshot',
        'name_product_snapshot',
        'variant_attributes_snapshot'
    ];

    // Tự động convert string json từ DB sang array khi sử dụng
    protected $casts = [
        'status' => Status::class,
        'variant_attributes_snapshot'=>'array'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function productVariant() {
        return $this->belongsTo(ProductVariant::class);
    }
}