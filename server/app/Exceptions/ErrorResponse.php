<?php

namespace App\Exceptions;

use Carbon\Carbon;

class ErrorResponse
{
    public string $timestamp;
    public int $status;
    public string $path;
    public string $error;
    public string $message;
    public ?array $details;
    public mixed $data;

    public function __construct(
        int $status,
        string $path,
        string $error,
        string $message,
        ?array $details = null,
        mixed $data = null
    ) {
        $this->timestamp = Carbon::now()->toISOString();
        $this->status = $status;
        $this->path = $path;
        $this->error = $error;
        $this->message = $message;
        $this->details = $details;
        $this->data = $data;
    }

    /**
     * Convert to array (response json)
     */
    public function toArray(): array
    {
        return [
            'timestamp' => $this->timestamp,
            'status' => $this->status,
            'path' => $this->path,
            'error' => $this->error,
            'message' => $this->message,
            'details' => $this->details,
            'data' => $this->data,
        ];
    }
}
