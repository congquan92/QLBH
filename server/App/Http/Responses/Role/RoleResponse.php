<?php
namespace App\Http\Responses\Role;


class RoleResponse {
    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
        public string $status,
        public array $page    
    ) {}
}