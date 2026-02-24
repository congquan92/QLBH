<?php

namespace App\Models;

use App\Enums\Status;
use Illuminate\Database\Eloquent\Model;

class GroupPermission extends Model
{
    protected $fillable = [
        'name',
        'description',
        'status'
    ];
     protected $casts = [
        'status' => Status::class,
    ];
    public function permissions()
    {
        return $this->belongsToMany(
            Permission::class,
            'permission_group_detail',
            'group_permission_id',
            'permission_id'
        );
    }
     public function roles()
    {
        return $this->belongsToMany(
            Role::class,
            'role_group_permission',
            'group_permission_id',
            'role_id'
        );
    }
}
