<?php
namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\PostTooLargeException;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class GlobalException extends ExceptionHandler
{
    protected function invalidJson($request, ValidationException $exception)
    {
        $errors = collect($exception->errors())->flatten()->toArray();

        return response()->json([
            'timestamp' => now(),
            'status' => ErrorCode::INVALID_KEY->httpStatus(),
            'path' => $request->getRequestUri(),
            'error' => Response::$statusTexts[ErrorCode::INVALID_KEY->httpStatus()],
            'message' => 'Validation failed',
            'details' => $errors,
        ], ErrorCode::INVALID_KEY->httpStatus());
    }

    protected function unauthenticated($request, AuthenticationException $exception)
    {
        return response()->json([
            'timestamp' => now(),
            'status' => ErrorCode::UNAUTHENTICATED->httpStatus(),
            'path' => $request->getRequestUri(),
            'error' => Response::$statusTexts[ErrorCode::UNAUTHENTICATED->httpStatus()],
            'message' => MessageError::UNAUTHENTICATED,
        ], ErrorCode::UNAUTHENTICATED->httpStatus());
    }

    public function render($request, Throwable $exception)
    {
        if ($exception instanceof BusinessException) {
            return response()->json([
                'timestamp' => now(),
                'status' => $exception->getStatus(),
                'path' => $request->getRequestUri(),
                'error' => Response::$statusTexts[$exception->getStatus()],
                'message' => $exception->getMessage(),
                'data' => $exception->getData(),
            ], $exception->getStatus());
        }

        if ($exception instanceof AuthorizationException) {
            return response()->json([
                'timestamp' => now(),
                'status' => ErrorCode::UNAUTHORIZED->httpStatus(),
                'path' => $request->getRequestUri(),
                'error' => Response::$statusTexts[ErrorCode::UNAUTHORIZED->httpStatus()],
                'message' => MessageError::UNAUTHORIZED,
            ], ErrorCode::UNAUTHORIZED->httpStatus());
        }

        if ($exception instanceof NotFoundHttpException) {
            return response()->json([
                'timestamp' => now(),
                'status' => 404,
                'path' => $request->getRequestUri(),
                'error' => 'Not Found',
                'message' => $exception->getMessage(),
            ], 404);
        }

        return response()->json([
            'timestamp' => now(),
            'status' => 500,
            'path' => $request->getRequestUri(),
            'error' => 'Internal Server Error',
            'message' => app()->isLocal() ? $exception->getMessage() : 'Unexpected error',
        ], 500);
    }
}
