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
        'isDefault',
        'user_id'
    ];

    protected $casts = [
        'addressType' => AddressType::class
    ];

    /**
     * Quan hệ Many to Many với User
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_address', 'address_id', 'user_id');
    }
}
