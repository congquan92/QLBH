<?php
namespace App\Http\Responses\Role;

use App\Http\Responses\PageResponse;

class RoleResponse {
    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
        public string $status,
        public array $page    
    ) {}
}