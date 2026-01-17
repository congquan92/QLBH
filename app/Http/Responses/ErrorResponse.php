<?php

class ErrorResponse{
    public static function make(
        int $status,
        string $message,
        string $path,
        ?array $details = null,
        ?array $data = null,
        ?string $error = null
    ){
        return [
            'timestamp' => now(),
            'status'    => $status,
            'path'      => $path,
            'error'     => $error,
            'message'   => $message,
            'details'   => $details,
            'data'      => $data,
        ];
    }
}