<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductAttribute extends Model
{
    /** @use HasFactory<\Database\Factories\ProductAttributeFactory> */
    use HasFactory;
    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';
    protected $fillable = [
        'product_id',
        'attribute_id'
    ];
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    public function values()
    {
        return $this->hasMany(ProductAttributeValue::class);
    }
}
