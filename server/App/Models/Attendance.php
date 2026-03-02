<?php
namespace App\Models;
use App\Enums\CheckInStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = ['user_id', 'is_holiday','date', 'check_in', 'check_out', 'total_hours', 'status'];

    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'status' => CheckInStatus::class
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}