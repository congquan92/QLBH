<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use App\Enums\Status;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportProduct extends Model
{
    /** @use HasFactory<\Database\Factories\ImportProductFactory> */
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'description',
        'product_id',
        'totalAmount',
        'status',
        'view_status'
    ];

    protected $casts = [
        'status' => DeliveryStatus::class,
        'view_status' => Status::class
    ];

    public function importDetail()
    {
        return $this->hasMany(ImportDetail::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
