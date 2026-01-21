<?php
namespace App\Http\Responses\attributeValue;
class AttributeValueResponse {
    public function __construct(
        public int $id,
        public string $value
    ) {}
}