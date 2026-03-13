<?php

namespace App\Models;

use App\Enums\Status;
use Illuminate\Database\Eloquent\Model;

class GroupPermission extends Model
{
    protected $fillable = [
        'name',
        'description',
        'url',
        'icon',
        'page_id',
        'status'
    ];
    protected $casts = [
        'status' => Status::class,
    ];
    public function page()
    {
        return $this->belongsTo(Page::class);
    }
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'permission_group_detail');
    }
    // App/Models/GroupPermission.php

// App/Models/GroupPermission.php
public function roles()
{
    return $this->belongsToMany(
        Role::class, 
        'roles_group_permissions', 
        'group_permission_id', // Khóa ngoại của chính nó
        'role_id'              // Khóa ngoại của Role
    );
}
}
