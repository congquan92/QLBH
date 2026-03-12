<?php

namespace App\Models;

use App\Enums\Status;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['name', 'description', 'status'];
    protected $casts = ['status' => Status::class];

    // QUAN TRỌNG: Role giờ gán trực tiếp cho các mục con (GroupPermission)
    // App/Models/Role.php
   // App/Models/Role.php
   public function groupPermissions()
{
    return $this->belongsToMany(
        GroupPermission::class, 
        'roles_group_permissions', // Tên bảng phụ
        'role_id',               // Khóa ngoại của bảng Role
        'group_permission_id'    // Khóa ngoại của bảng GroupPermission (Phải khớp migration)
    );
}
    // Lấy danh sách các Page "cha" mà Role này có ít nhất 1 quyền con bên trong
    public function pages()
    {
        // Trả về Builder để có thể eager load trong Service
        return Page::whereHas('groupPermissions', function ($q) {
            $q->whereHas('roles', function ($rq) {
                $rq->where('roles.id', $this->id);
            });
        });
    }
}
