<?php
namespace App\Models;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class JobHistory extends Model {
    protected $fillable = ['user_id', 'position_id', 'current_salary', 'employment_type', 'effective_date', 'end_date'];

    public function position() {
        return $this->belongsTo(Position::class);
    }
    public function user() {
        return $this->belongsTo(User::class);
    }
}