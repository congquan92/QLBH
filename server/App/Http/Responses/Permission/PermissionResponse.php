<?php
namespace App\Http\Responses\Permission;
class PermissionResponse {
    public function __construct(
        public int $id,
        public string $name,
        public string $description,
        public string $status
    ) {}
}