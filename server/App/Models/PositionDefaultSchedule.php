<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PositionDefaultSchedule extends Model {
    protected $fillable = ['position_id', 'day_of_week', 'shift_id'];

    public function shift() {
        return $this->belongsTo(Shift::class);
    }
}