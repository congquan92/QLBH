<?php

namespace App\Exceptions;

use Exception;

class BusinessException extends Exception
{
    protected int $codeValue;
    protected int $status;
    protected mixed $data;

    public function __construct(
        ErrorCode $errorCode,
        string $message,
        mixed $data = null
    ) {
        parent::__construct($message);

        $this->codeValue = $errorCode->value;
        $this->status = $errorCode->httpStatus();
        $this->data = $data;
    }

    public function getCodeValue(): int
    {
        return $this->codeValue;
    }

    public function getStatus(): int
    {
        return $this->status;
    }

    public function getData(): mixed
    {
        return $this->data;
    }
}
