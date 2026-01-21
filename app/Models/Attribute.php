<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    /** @use HasFactory<\Database\Factories\AttributeFactory> */
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'name'
    ];


    public function products()
    {
        return $this->belongsToMany(
            Product::class,
            'product_attribute',
            'attribute_id',
            'product_id'
        );
    }

    public function productAttributes(){
        return $this->hasMany(ProductAttribute::class);
    }

}
