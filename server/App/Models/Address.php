<?php

namespace App\Models;

use App\Enums\AddressType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'address',
        'customer_name',
        'phone_number',
        'province',
        'district',
        'ward',
        'province_id',
        'district_id',
        'ward_id',
        'address_type',
        'is_default',
        'user_id'
    ];

    protected $casts = [
        'addressType' => AddressType::class
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
