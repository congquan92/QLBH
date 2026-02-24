<?php
namespace App\Models;

use App\Enums\EmploymentType;
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

    protected $casts = [
        'employee_type' => EmploymentType::class,
    ];

}