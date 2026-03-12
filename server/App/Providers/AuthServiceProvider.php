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
        Gate::before(function ($user, $ability) {
            if ($user->role?->name === RoleType::ADMIN->value) {
                return true;
            }
        });

        // CHỈ CHẠY LOGIC GATE KHI KHÔNG PHẢI TRONG TERMINAL/SEEDER
        if (!app()->runningInConsole()) {
            try {
                $permissions = Cache::rememberForever('active_permissions_list', function () {
                    // Kiểm tra bảng tồn tại để tránh lỗi khi migrate chưa xong
                    if (!\Schema::hasTable('permissions'))
                        return collect();
                    return Permission::where('status', 'ACTIVE')->pluck('name');
                });

                foreach ($permissions as $permissionName) {
                    Gate::define($permissionName, function ($user) use ($permissionName) {
                        if (!$user->role)
                            return false;
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
}