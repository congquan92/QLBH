<?php

namespace App\Exceptions;

use Symfony\Component\HttpFoundation\Response;

enum ErrorCode: int
{
    case UNCATEGORIZED_EXCEPTION = 9999;
    case INVALID_KEY = 1001;
    case EXISTED = 1002;
    case NOT_EXISTED = 1005;
    case UNAUTHENTICATED = 1006;
    case UNAUTHORIZED = 1007;
    case BAD_REQUEST = 111;
    case INVALID_OPERATION = 112;
    case DUPLICATE = 113;
    case NOT_VERIFY = 1000;

    public function httpStatus(): int
    {
        return match ($this) {
            self::UNCATEGORIZED_EXCEPTION => Response::HTTP_INTERNAL_SERVER_ERROR,
            self::INVALID_KEY,
            self::EXISTED,
            self::BAD_REQUEST,
            self::INVALID_OPERATION,
            self::NOT_VERIFY => Response::HTTP_BAD_REQUEST,

            self::NOT_EXISTED => Response::HTTP_NOT_FOUND,
            self::UNAUTHENTICATED => Response::HTTP_UNAUTHORIZED,
            self::UNAUTHORIZED => Response::HTTP_FORBIDDEN,
            self::DUPLICATE => Response::HTTP_CONFLICT,
        };
    }
}
