<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductAttributeValue extends Model
{
    /** @use HasFactory<\Database\Factories\ProductAttributeValueFactory> */
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';
    protected $fillable = ['product_attribute_id', 'value', 'url_image'];

    public function productAttribute()
    {
        return $this->belongsTo(ProductAttribute::class);
    }

    public function productVariants()
    {
        return $this->belongsToMany(ProductVariant::class, 'product_variant_attribute_value', 'product_attribute_value_id', 'product_variant_id')
        ->withTimestamps();;
    }
}
