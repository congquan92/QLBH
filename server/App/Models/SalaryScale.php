<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SalaryScale extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'years_of_experience',
        'coefficient',
    ];

    protected $casts = [
        'coefficient' => 'float',
    ];
}