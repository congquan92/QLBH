<?php

namespace App\Providers;

use App\Models\Permission;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // 1. Quyền ưu tiên tuyệt đối cho ADMIN
        Gate::before(function ($user, $ability) {
            if ($user->role?->name === 'ADMIN') {
                return true;
            }
        });

        // 2. Định nghĩa Gate động dựa trên Database
        try {
            // Nên sử dụng Cache để tránh query database hàng trăm lần mỗi khi load trang
            $permissions = Cache::rememberForever('active_permissions_list', function () {
                return Permission::where('status', 'ACTIVE')->pluck('name');
            });

            foreach ($permissions as $permissionName) {
                Gate::define($permissionName, function ($user) use ($permissionName) {
                    
                    if (!$user->role) return false;

                    // Logic Mới: Role -> Pages -> GroupPermissions -> Permission
                    return $user->role->pages() // Kiểm tra các Page mà Role được gán
                        ->whereHas('groupPermissions', function ($query) use ($permissionName) {
                            $query->whereHas('permissions', function ($q) use ($permissionName) {
                                $q->where('name', $permissionName)
                                  ->where('permissions.status', 'ACTIVE');
                            });
                        })->exists();
                });
            }
        } catch (\Exception $e) {
            Log::error("Phân quyền Gate lỗi: " . $e->getMessage());
        }
    }
}