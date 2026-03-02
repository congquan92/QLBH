<?php

namespace App\Models;

use App\Enums\Status;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRank extends Model
{
    /** @use HasFactory<\Database\Factories\UserRankFactory> */
    use HasFactory;


    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'name',
        'min_spent',
        'status'
    ];
    protected $casts = [
        'status' => Status::class,
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function vouchers(){
        return $this->hasMany(Voucher::class);
    }
}
