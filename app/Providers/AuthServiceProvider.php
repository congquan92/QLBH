<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->registerPolicies();

        Gate::define('create-categories', function ($user) {
            return $user->hasRole('ADMIN')
                || $user->hasPermission('CREATE_CATEGORIES');
        });
    }
}
