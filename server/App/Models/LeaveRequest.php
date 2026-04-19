<?php

namespace App\Models;

use App\Enums\LeaveStatus;
use App\Enums\LeaveType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRequest extends Model
{
    protected $fillable = [
        'user_id',
        'shift_id',
        'leave_type',
        'start_date',
        'end_date',
        'leave_date',
        'reason',
        'status',
        'approved_by',
    ];

    protected $casts = [
        'status' => LeaveStatus::class,
        'leave_type' => LeaveType::class,
        'start_date' => 'date',
        'end_date' => 'date',
        'leave_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}