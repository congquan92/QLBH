<?php

namespace App\Models;

use App\Enums\Status;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Role extends Model
{
    use HasFactory;

    protected $fillable = ['id','name', 'description', 'status'];
    protected $casts = ['status' => Status::class];

    // 1. Role Many-to-Many với Page
    public function pages()
    {
        return $this->belongsToMany(Page::class, 'roles_pages', 'role_id', 'page_id');
    }

    // 2. Lấy GroupPermissions thông qua Page (Linh động)
    public function groupPermissions()
    {
        return $this->hasManyThrough(
            GroupPermission::class,
            Page::class,
            'id', // Khóa ngoại trên bảng trung gian roles_pages (không đúng, cần xử lý qua pages)
            'page_id', // Khóa ngoại trên GroupPermission
            'id', // Khóa nội của Role
            'id'  // Khóa nội của Page
        )->join('roles_pages', 'pages.id', '=', 'roles_pages.page_id')
         ->where('roles_pages.role_id', $this->id);
    }

    // 3. Lấy toàn bộ mã Permission để check quyền (Hành động)
    public function permissions()
    {
        return Permission::whereHas('groupPermissions', function($query) {
            $query->whereHas('page', function($q) {
                $q->whereHas('roles', function($rq) {
                    $rq->where('roles.id', $this->id);
                });
            });
        });
    }
}
