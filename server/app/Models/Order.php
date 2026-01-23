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
        'customerName',
        'customerPhone',
        'deliveryWardName',
        'deliveryWardCode',
        'deliveryDistrictId',
        'deliveryProvinceId',
        'deliveryDistrictName',
        'deliveryProvinceName',
        'deliveryAddress',
        'serviceTypeId',
        'originalOrderAmount',
        'weight',
        'length',
        'width',
        'height',
        'totalFeeForShip',
        'orderTrackingCode',
        'note',
        'isPaidForShip',
        'totalAmount',
        'orderStatus',
        'paymentType',
        'paymentStatus',
        'deliveredAt',
        'completedAt',
        'paymentAt',
        'isConfirmed'
    ];

    protected $casts = [
        'orderStatus' => DeliveryStatus::class,
        'paymentType' => PaymentType::class,
        'paymentStatus' => PaymentStatus::class,
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function orderItem(){
        return $this->hasMany(OrderItem::class);
    }
    
    public function voucher(){
        return $this->belongsTo(Voucher::class);
    }

}
