<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\Status;

class Permission extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'description',
        'status'
    ];

    protected $casts = [
        'status' => Status::class
    ];

     public function groupPermissions()
    {
        return $this->belongsToMany(
            GroupPermission::class,
            'permission_group_detail',
            'permission_id',
            'group_permission_id'
        );
    }
}

