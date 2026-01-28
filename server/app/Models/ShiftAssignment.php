<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class ShiftAssignment extends Model {
    protected $fillable = ['user_id', 'shift_id', 'date'];
    
    public function shift() {
        return $this->belongsTo(Shift::class);
    }
    public function user() {
        return $this->belongsTo(User::class);
    }
}