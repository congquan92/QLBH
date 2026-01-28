<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaryConfig extends Model
{
    protected $table = 'salary_configs';

    protected $fillable = [
        'rule_name',
        'employee_type',
        'multiplier',
        'is_holiday'
    ];
}