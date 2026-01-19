<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImageProduct extends Model
{
    /** @use HasFactory<\Database\Factories\ImageProductFactory> */
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'url',
        'product_id'
    ];

    public function products(){
        return $this -> belongsTo(Product::class);
    }


}
