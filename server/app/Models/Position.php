<?php

namespace App\Models;

use App\Enums\SalaryType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;

    protected $table = 'positions';

    protected $fillable = [
        'name',
        'base_salary',
        'salary_type'
    ];
    protected $casts = [
        'salary_type' => SalaryType::class,
    ];
    public function jobHistories()
    {
        return $this->hasMany(JobHistory::class, 'position_id');
    }

    public function currentEmployees()
    {
        return $this->hasManyThrough(
            User::class,
            JobHistory::class,
            'position_id', // Khóa ngoại trên bảng JobHistory
            'id',          // Khóa ngoại trên bảng User
            'id',          // Khóa nội trên bảng Position
            'user_id'      // Khóa nội trên bảng JobHistory
        )->whereNull('job_histories.end_date');
    }


    public function isHourly(): bool
    {
        return $this->salary_type === 'HOURLY';
    }

    public function isMonthly(): bool
    {
        return $this->salary_type === 'MONTHLY';
    }
}