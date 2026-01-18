<?php

namespace App\Http\Middleware;

use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use Closure;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Tymon\JWTAuth\Facades\JWTAuth;

class JwtAuthenticate
{
    public function handle($request, Closure $next)
    {

        $payload = JWTAuth::parseToken()->getPayload();
        $user = JWTAuth::parseToken()->authenticate();

        Log::info('JwtAuthenticate hit', [
            'user_id' => $user->id,
            'ver_token' => $payload->get('ver'),
            'ver_db' => $user->token_version,
        ]);

        if ((int) $payload->get('ver') !== (int) $user->token_version) {
            throw new BusinessException(
                ErrorCode::UNAUTHENTICATED
                ,
                "Unauthenticated"
            );
        }
        return $next($request);
    }
}


