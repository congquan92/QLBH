<?php
namespace App\Http\Responses\variantAttribute;
class VariantAttributeResponse {
    public function __construct(
        public int $id,
        public string $attribute,
        public string $value     
    ) {}
}