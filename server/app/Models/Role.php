<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Role extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'description',
        'status',
    ];

    public function groupPermissions()
    {
        return $this->belongsToMany(
            GroupPermission::class,
            'role_group_permission',
            'role_id',
            'group_permission_id'
        );
    }
}
