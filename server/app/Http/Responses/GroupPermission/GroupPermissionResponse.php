<?php
namespace App\Http\Responses\GroupPermission;
class GroupPermissionResponse {
    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
        public string $status,
        public array $permission=[]    
    ) {}
}