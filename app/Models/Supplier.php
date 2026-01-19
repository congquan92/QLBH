<?php

namespace App\Models;

use App\Enums\Status;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    /** @use HasFactory<\Database\Factories\SupplierFactory> */
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'address',
        'province',
        'district',
        'ward',
        'province_id',
        'district_id',
        'ward_id',
        'phone',
        'status'
    ];

    protected $casts = [
        'status' => Status::class,
    ];

    public function products(){
        return $this->hasMany(Product::class);
    }

}
