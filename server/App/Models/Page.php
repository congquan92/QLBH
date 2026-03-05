<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true; // auto increment
    protected $keyType = 'int';

    protected $fillable = [
        'title',
        'icon',
        'sort_order'
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'roles_pages', 'page_id', 'role_id');
    }
    public function groupPermissions()
    {
        return $this->hasMany(GroupPermission::class, 'page_id');
    }
}
