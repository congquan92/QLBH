<?php

namespace App\Models;

use App\Enums\EmploymentType;
use App\Enums\Gender;
use App\Enums\UserStatus;
use App\Models\Attendance;
use App\Models\JobHistory;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Foundation\Auth\User as Authenticatable;


/**
 * @property-read \Illuminate\Database\Eloquent\Collection|Role[] $roles
 */
class User extends Authenticatable implements JWTSubject
{
    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'full_name',
        'email',
        'password',
        'username',
        'phone',
        'gender',
        'avatar',
        'date_of_birth',
        'point',
        'email_verified',
        'phone_verified',
        'total_spent',
        'token_version',
        'provider',
        'provider_id',
        'status',
        'role_id',
        'user_rank_id',
        'position_id'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'gender' => Gender::class,
        'status' => UserStatus::class
    ];

    protected $hidden = ['password'];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {

        $roleName = $this->role ? 'ROLE_' . $this->role->name : null;

        return [
            'email' => $this->email,
            'scope' => $roleName,
            'ver' => $this->token_version,
        ];
    }


    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function favoriteProduct()
    {
        return $this->belongsToMany(Product::class, 'favoriteProducts', 'user_id', 'product_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function userRank()
    {
        return $this->belongsTo(UserRank::class);
    }

    public function address()
    {
        return $this->hasMany(Address::class);
    }

    public function carts()
    {
        return $this->hasMany(Cart::class);
    }

    public function voucherUsages()
    {
        return $this->hasMany(VoucherUsage::class);
    }

    public function jobHistories()
    {
        return $this->hasMany(JobHistory::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }


    public function currentJob()
    {
        return $this->hasOne(JobHistory::class)
            ->whereNull('end_date')
            ->orWhere('end_date', '>=', now())
            ->latest('effective_date');
    }
    public function getEmploymentTypeAttribute()
    {
        return $this->currentJob?->employment_type;
    }

    public function getIsFullTimeAttribute(): bool
    {
        return $this->currentJob?->employment_type === EmploymentType::FULLTIME;
    }
    public function getCurrentSalaryAttribute()
    {
        return $this->currentJob?->current_salary ?? $this->position?->base_salary ?? 0;
    }

    public function getSalaryTypeAttribute()
    {
        return $this->position?->salary_type;
    }
}
