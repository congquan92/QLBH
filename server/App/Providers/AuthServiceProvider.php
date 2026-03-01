<?php

namespace App\Providers;

use App\Models\Permission;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // 1. Quyền ưu tiên: ADMIN luôn trả về true cho mọi Gate
        Gate::before(function ($user, $ability) {
            if ($user->role?->name === 'ADMIN') {
                return true;
            }
        });

        // 2. Định nghĩa Gate động dựa trên Database
        // Logic: Lấy tất cả tên permissions có trong máy để định nghĩa Gate tương ứng
        try {
            // Lấy danh sách tên tất cả permission (nên cache lại để tối ưu performance)
            $permissions = Permission::where('status', 'ACTIVE')->pluck('name');

            foreach ($permissions as $permissionName) {
                Gate::define($permissionName, function ($user) use ($permissionName) {
                    
                    // Kiểm tra User có Role không
                    if (!$user->role) return false;

                    // Logic kiểm tra: Role -> Group -> Permission
                    return $user->role->groupPermissions()
                        ->whereHas('permissions', function ($query) use ($permissionName) {
                            $query->where('name', $permissionName)
                                  ->where('permissions.status', 'ACTIVE');
                        })->exists();
                });
            }
        } catch (\Exception $e) {
            // Tránh lỗi khi chạy migration lần đầu chưa có bảng permissions
            Log::error("Phân quyền Gate lỗi: " . $e->getMessage());
        }
    }
}
