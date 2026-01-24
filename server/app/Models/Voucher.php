<?php

namespace App\Models;

use App\Enums\VoucherStatus;
use App\Enums\VoucherType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    /** @use HasFactory<\Database\Factories\VoucherFactory> */
    use HasFactory;


    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'description',
        'type',
        'discount_value',
        'max_discount_value',
        'min_discount_value',
        'total_quantity',
        'is_shipping',
        'status',
        'used_quantity',
        'remaining_quantity',
        'start_date',
        'end_date',
        'user_rank_id',
        'usage_limit_per_user',
    ];

     protected $casts = [
        'type' => VoucherType::class,
        'status' => VoucherStatus::class
    ];
    
    public function userRank(){
        return $this->belongsTo(UserRank::class);
    }

    public function voucherUsages(){
        return $this->hasMany(VoucherUsage::class);
    }
}
