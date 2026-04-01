<?php
namespace App\Models;
use App\Enums\CheckInStatus;
use App\Models\User;
use App\Models\Shift;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = ['user_id', 'is_holiday','date', 'check_in', 'check_out', 'total_hours', 'status', 'shift_id'];

    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'status' => CheckInStatus::class
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }
}