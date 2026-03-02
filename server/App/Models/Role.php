<?php

namespace App\Models;

use App\Enums\Status;
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

    protected $casts = [
        'status' => Status::class
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

    public function permissions()
    {
        // Lấy tất cả permissions thông qua mối quan hệ với GroupPermission
        return $this->hasManyThrough(
            Permission::class,
            GroupPermission::class,
            'id', // Khóa ngoại trên GroupPermission (sẽ được map qua bảng trung gian)
            'id', // Khóa ngoại trên Permission
            'id', // Khóa nội trên Role
            'id'  // Sẽ được Laravel xử lý qua bảng pivot
        )->join('permission_group_detail', 'permissions.id', '=', 'permission_group_detail.permission_id')
            ->join('role_group_permission', 'permission_group_detail.group_permission_id', '=', 'role_group_permission.group_permission_id')
            ->where('role_group_permission.role_id', $this->id);
    }
}
