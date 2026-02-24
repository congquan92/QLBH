<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    /** @use HasFactory<\Database\Factories\CartFactory> */
    use HasFactory;


    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'quantity',
    ];

    public function productVariant(){
        return $this -> belongsTo(ProductVariant::class);
    }
    public function user(){
        return $this -> belongsTo(User::class);
    }
}
