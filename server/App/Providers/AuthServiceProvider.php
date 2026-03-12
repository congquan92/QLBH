<?php

namespace App\Providers;

use App\Enums\RoleType;
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
            if ($user->role?->name === RoleType::ADMIN->value) {
                return true;
            }
        });

        // 2. Định nghĩa Gate động dựa trên Database
        try {
            // Lấy danh sách tên tất cả Permission đang ACTIVE
            $permissions = Cache::rememberForever('active_permissions_list', function () {
                return Permission::where('status', 'ACTIVE')->pluck('name');
            });

            foreach ($permissions as $permissionName) {
                Gate::define($permissionName, function ($user) use ($permissionName) {
                    
                    if (!$user->role) return false;

                    // LOGIC MỚI: Kiểm tra trực tiếp Role -> GroupPermissions -> Permissions
                    // Cách này bỏ qua bảng 'pages', giúp check quyền hành động (Create, Update, Delete) cực nhanh
                    return $user->role->groupPermissions()
                        ->whereHas('permissions', function ($query) use ($permissionName) {
                            $query->where('name', $permissionName)
                                  ->where('permissions.status', 'ACTIVE');
                        })->exists();
                });
            }
        } catch (\Exception $e) {
            Log::error("Phân quyền Gate lỗi: " . $e->getMessage());
        }
    }
}