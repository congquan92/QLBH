<?php

namespace App\Exceptions;

class VerifyAccountData
{
    public function __construct(
        public int $userId,
        public string $email
    ) {}

    public function toArray(): array
    {
        return [
            'userId' => $this->userId,
            'email' => $this->email,
        ];
    }
}
