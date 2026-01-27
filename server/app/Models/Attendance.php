<?php
namespace App\Models;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = ['user_id', 'date', 'check_in', 'check_out', 'total_hours', 'status'];

    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}