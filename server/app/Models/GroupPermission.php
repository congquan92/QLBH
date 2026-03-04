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
}
