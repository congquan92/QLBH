<?php

use App\Exceptions\GlobalException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function(){
            Route::middleware('api')
            ->prefix('api')
            ->name('api.')
            -> group(base_path('routes/api.php'));
        }
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // Global middleware (chạy mọi request)
        // $middleware->append(App\Http\Middleware\TrustProxies::class);
    
        // Alias middleware (giống @PreAuthorize)
        $middleware->alias([
            'jwt.auth' => \App\Http\Middleware\JwtAuthenticate::class,
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
     ->withExceptions(function (Exceptions $exceptions): void {

        // ===== Bắt mọi exception =====
        $exceptions->reportable(function (Throwable $e) {
            // Bạn có thể log vào file hoặc Sentry
            // report($e);
        });

        $exceptions->renderable(function (Throwable $e, $request) {
            // Chuyển tất cả exception vào GlobalException
            return app(GlobalException::class)->render($request, $e);
        });
    })
    ->create();
