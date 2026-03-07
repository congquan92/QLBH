<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'customer_name',
        'customer_phone',
        'delivery_ward_name',
        'delivery_ward_code',
        'delivery_district_id',
        'delivery_province_id',
        'delivery_district_name',
        'delivery_province_name',
        'delivery_address',
        'service_type_id',
        'original_order_amount',
        'weight',
        'length',
        'width',
        'height',
        'total_fee_for_ship',
        'order_tracking_code',
        'note',
        'total_amount',
        'order_status',
        'payment_type',
        'voucher_snapshot',
        'voucher_discount_value',
        'payment_status',
        'delivered_at',
        'completed_at',
        'payment_at',
        'voucher_id',
        'user_id',
        'is_confirmed'
    ];

    protected $casts = [
        'order_status' => DeliveryStatus::class,
        'payment_type' => PaymentType::class,
        'payment_status' => PaymentStatus::class,
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function orderItem(){
        return $this->hasMany(OrderItem::class);
    }
    public function voucherUsage()
    {
        return $this->hasOne(VoucherUsage::class, 'order_id', 'id');
    }
}
