<?php
namespace App\Http\Responses\User;

use App\Http\Responses\Role\RoleResponse;
use App\Http\Responses\UserRank\UserRankResponse;

class UserResponse {
    public function __construct(
        public int $id,
        public ?string $userName,
        public ?string $fullName,
        public ?string $gender,
        public ?string $dateOfBirth,
        public ?string $email,
        public ?string $phone,
        public ?string $avatar,
        public ?string $status,
        public ?int $point,
        public ?bool $verifiedEmail,
        public ?bool $verifiedPhone,
        public ?float $totalSpent,
        public ?array $addressResponses,
        public ?UserRankResponse $userRankResponse, 
        public ?RoleResponse $role
    ) {}
}