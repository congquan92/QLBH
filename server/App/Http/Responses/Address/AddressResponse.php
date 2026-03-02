<?php
namespace App\Http\Responses\Address;
class AddressResponse {
    public function __construct(
        public int $id,
        public string $address,
        public string $customerName,
        public string $phoneNumber,
        public string $province,
        public string $district,
        public string $ward,
        public int $provinceId,
        public int $districtId,
        public int $wardId,
        public string $addressType,
        public bool $isDefault,  
    ) {}
}