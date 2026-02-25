<?php

namespace App\Models;

use App\Enums\SalaryType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Position extends Model
{
    use HasFactory;

    protected $table = 'positions';

    protected $fillable = [
        'name',
        'base_salary',
        'salary_type',
    ];
    protected $casts = [
        'salary_type' => SalaryType::class,
    ];
    public function jobHistories()
    {
        return $this->hasMany(JobHistory::class, 'position_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'position_id');
    }


    public function currentEmployees()
    {
        return $this->hasManyThrough(
            User::class,
            JobHistory::class,
            'position_id',
            'id',
            'id',
            'user_id'
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
    public function defaultSchedules(): HasMany
    {
        return $this->hasMany(PositionDefaultSchedule::class);
    }
}