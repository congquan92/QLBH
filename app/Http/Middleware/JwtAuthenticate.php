<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Redis;

class JwtAuthenticate
{
    public function handle($request, Closure $next)
    {
        try {
            $user = auth()->user();
            $jti = auth()->payload()->get('jti');

            if (Redis::exists("invalidToken:$jti")) {
                return response()->json(['message'=>'Token invalid'], 401);
            }

        } catch (\Exception $e) {
            return response()->json(['message'=>'Unauthenticated'], 401);
        }

        return $next($request);
    }
}

