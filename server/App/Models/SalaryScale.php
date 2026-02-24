<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\Status;

class SalaryScale extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'years_of_experience',
        'coefficient',
        'status'
    ];

    protected $casts = [
        'status' => Status::class,
        'coefficient' => 'float',
    ];
}