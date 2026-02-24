<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    /** @use HasFactory<\Database\Factories\OrderItemFactory> */
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'quantity',
        'is_reviewed',
        'final_price',
        'list_price_snapShot',
        'name_product_snapshot',
        'url_image_snapShot',
        'order_id',
        'product_id',
        'product_variant_id',
        'variant_attributes_snapshot',
    ];

    protected $casts = [
        'variant_attributes_snapshot' => 'array'
    ];

    public function order(){
        return $this -> belongsTo(Order::class);
    }    

    public function review(){
        return $this -> hasMany(Review::class);
    }
    public function product() {
        return $this->belongsTo(Product::class);
    }
}
