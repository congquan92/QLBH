<?php
namespace App\Http\Responses\VariantAttribute;
class VariantAttributeResponse {
    public function __construct(
        public int $id,
        public string $attribute,
        public string $value     
    ) {}
}