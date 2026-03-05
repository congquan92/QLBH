<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportDetail extends Model
{
    /** @use HasFactory<\Database\Factories\ImportDetailFactory> */
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'quantity',
        'unitPrice',
        'product_variant_id',
        'nameProductSnapShot',
        'urlImageSnapShot',
        'variantAttributesSnapshot',
    ];


    public function importProduct()
    {
        return $this->belongsTo(ImportProduct::class);
    }
}
