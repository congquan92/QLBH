<?php

namespace App\Http\Responses\Auth;

use App\Enums\Gender;
use App\Enums\UserStatus;
use Carbon\Carbon;

class IntrospectResponse
{
    public function __construct(
        public string $fullName,
        public string $avatar,
        public string $email,
        public Gender $gender,
        public bool $valid,
        public string $role,
        public UserStatus $status
    ) {}

    public function toArray(): array
    {
        return [
            'fullName' => $this->fullName   ,
            'avatar' => $this->avatar,
            'email'=> $this->email,
            'gender'=> $this->gender,
            'valid' => $this->valid,
            'role' => $this->role,
            'status' => $this->status,
        ];
    }
}
