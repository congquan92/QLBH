<?php

namespace App\Models;

use App\Enums\Status;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    /** @use HasFactory<\Database\Factories\ProductVariantFactory> */
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'sku',
        'price',
        'quantity',
        'weight',
        'length',
        'width',
        'height',
        'variant_attributes',
        'product_id',
        'status'
    ];

    protected $casts = [
        'status' => Status::class,
    ];

    public function cart()
    {
        return $this->hasMany(Cart::class);
    }

    public function attributeValues()
    {
        return $this->belongsToMany(ProductAttributeValue::class, 'product_variant_attribute_value', 'product_variant_id', 'product_attribute_value_id')
            ->withTimestamps();
        ;
    }
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

}
