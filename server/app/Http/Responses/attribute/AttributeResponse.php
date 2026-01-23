<?php
namespace App\Http\Responses\attribute;

class AttributeResponse {
    public function __construct(
        public int $id,
        public string $name,
        public array $attributeValue
    ) {}
}