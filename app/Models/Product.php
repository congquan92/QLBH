<?php

namespace App\Models;

use App\Enums\Status;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'url_video',
        'description',
        'url_image_cover',
        'list_price',
        'sale_price',
        'sold_quantity',
        'avg_rating',
        'out_standing',
        'supplier_id',
        'category_id',
        'status',
    ];

    protected $casts = [
        'status' => Status::class,
        'list_price' => 'decimal:2',
        'sale_price' => 'decimal:2'
    ];


    public function imageProducts()
    {
        return $this->hasMany(ImageProduct::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function productVariants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
    public function users()
    {
        return $this->belongsToMany(
            User::class,
            'favoriteProducts',
            'product_id',
            'user_id'
        );
    }
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function attributes()
    {
        return $this->belongsToMany(
            Attribute::class,
            'product_attribute',
            'product_id',
            'attribute_id'
        );
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function productAttributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }
}
