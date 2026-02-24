<?php

namespace App\Models;

use App\Enums\LeaveStatus;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    protected $fillable = [
        'user_id',
        'leave_date',
        'reason',
        'status',
        'approved_by',
    ];

    protected $casts = [
        'status' => LeaveStatus::class,
        'leave_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}