<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    /** @use HasFactory<\Database\Factories\ReviewFactory> */
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'rating',
        'user_id',
        'order_item_id',
        'product_id',
        'comment',
    ];

    public function user(){
        return $this -> belongsTo(User::class);
    }

    public function image(){
        return $this -> hasMany(ImageReview::class);
    }

    public function product(){
        return $this -> belongsTo(Product::class);
    }

    public function orderItem(){
        return $this->belongsTo(OrderItem::class);
    }
}
