<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class GlobalException extends ExceptionHandler
{
    protected function invalidJson($request, ValidationException $exception)
    {
        $errors = collect($exception->errors())->flatten()->toArray();
        $status = ErrorCode::INVALID_KEY->httpStatus();

        return response()->json([
            'timestamp' => now()->toIso8601String(),
            'status' => $status,
            'path' => $request->getRequestUri(),
            'error' => Response::$statusTexts[$status] ?? 'Bad Request',
            'message' => 'Validation failed',
            'details' => $errors,
        ], $status);
    }

    protected function unauthenticated($request, AuthenticationException $exception)
    {
        $status = ErrorCode::UNAUTHENTICATED->httpStatus();

        return response()->json([
            'timestamp' => now()->toIso8601String(),
            'status' => $status,
            'path' => $request->getRequestUri(),
            'error' => Response::$statusTexts[$status] ?? 'Unauthorized',
            'message' => MessageError::UNAUTHENTICATED,
        ], $status);
    }

    public function render($request, Throwable $exception)
    {
        // 1. Ưu tiên xử lý BusinessException trước
        if ($exception instanceof \App\Exceptions\BusinessException) {
            return response()->json([
                'timestamp' => now()->toIso8601String(),
                'status' => $exception->getStatus(),
                'path' => $request->getRequestUri(),
                'error' => Response::$statusTexts[$exception->getStatus()] ?? 'Business Error',
                'message' => $exception->getMessage(), // Luôn hiện tin nhắn thật (ví dụ: Username existed)
                'data' => $exception->getData(),
            ], $exception->getStatus());
        }

        // 2. Xử lý lỗi quyền truy cập
        if ($exception instanceof AuthorizationException) {
            $status = ErrorCode::UNAUTHORIZED->httpStatus();
            return response()->json([
                'timestamp' => now()->toIso8601String(),
                'status' => $status,
                'path' => $request->getRequestUri(),
                'error' => Response::$statusTexts[$status] ?? 'Forbidden',
                'message' => MessageError::UNAUTHORIZED,
            ], $status);
        }

        // 3. Xử lý lỗi không tìm thấy Route
        if ($exception instanceof NotFoundHttpException) {
            return response()->json([
                'timestamp' => now()->toIso8601String(),
                'status' => 404,
                'path' => $request->getRequestUri(),
                'error' => 'Not Found',
                'message' => $exception->getMessage() ?: 'The requested URL was not found.',
            ], 404);
        }

        // 4. Lỗi mặc định (Hệ thống sập, lỗi code, lỗi DB...)
        return response()->json([
            'timestamp' => now()->toIso8601String(),
            'status' => 500,
            'path' => $request->getRequestUri(),
            'error' => 'Internal Server Error',
            // Nếu là BusinessException nhưng bị lỗi lồng nhau, hoặc ở Local thì hiện lỗi thật, còn lại hiện Unexpected
            'message' => (app()->isLocal() || $exception instanceof \App\Exceptions\BusinessException) 
                         ? $exception->getMessage() 
                         : 'Unexpected error',
        ], 500);
    }
}