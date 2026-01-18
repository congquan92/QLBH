<?php

namespace App\Providers;

use App\Models\Role;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Laravel\Pail\ValueObjects\Origin\Console;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Gate::define('CREATE_CATEGORIES', function ($user) {
            Log::info('Gate CREATE_CATEGORIES', [
                'user_id' => $user->id ?? null,
                'role' => $user->role?->name,
            ]);
            if ($user->role?->name === 'ADMIN') {
                return true;
            }

            return $user->role
                && $user->role->permissions()
                    ->where('name', 'CREATE_CATEGORIES')
                    ->exists();
        });

    }
}
