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
        'isReviewed',
        'finalPrice',
        'listPriceSnapShot',
        'nameProductSnapShot',
        'urlImageSnapShot',
        'variantAttributesSnapshot',
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
