<?php

namespace App\Models;

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
        'description',
        'totalAmount',
        'status'
    ];

    protected $casts = [
        'status' => Status::class
    ];

    public function importDetail(){
        return $this -> hasMany(ImportDetail::class);
    }
}
