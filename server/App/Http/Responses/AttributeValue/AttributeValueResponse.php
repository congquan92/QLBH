<?php
namespace App\Http\Responses\AttributeValue;
class AttributeValueResponse {
    public function __construct(
        public int $id,
        public ?string $value,
        public ?string $image
    ) {}
}