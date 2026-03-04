<?php

namespace App\Http\Responses\Auth;

use App\Http\Responses\Role\RoleResponse;
use Carbon\Carbon;

class AuthenticationResponse
{
    public function __construct(
        public string $token,
        public bool $authenticated,
        public RoleResponse $role,
        public Carbon $expiredAt
    ) {}

    public function toArray(): array
    {
        return [
            'token' => $this->token,
            'authenticated' => $this->authenticated,
            'role' => $this->role,
            'expiredAt' => $this->expiredAt->toISOString(),
        ];
    }
}
