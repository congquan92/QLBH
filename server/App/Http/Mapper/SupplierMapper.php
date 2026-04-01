<?php

namespace App\Http\Mapper;

use App\Models\Supplier;

class SupplierMapper
{
    public static function toResponse(Supplier $supplier): array
    {
        $addressParts = array_filter([
            $supplier->address,
            $supplier->ward,
            $supplier->district,
            $supplier->province,
        ], fn($item) => !empty($item));

        return [
            'id'            => $supplier->id,
            'name'          => $supplier->name,
            'phone'         => $supplier->phone,
            'address'       => $supplier->address,
            'ward'          => $supplier->ward,
            'district'      => $supplier->district,
            'province'      => $supplier->province,
            'status'        => $supplier->status->value,
            'full_address'  => implode(', ', $addressParts),
            'location' => [
                'province_id' => $supplier->province_id,
                'district_id' => $supplier->district_id,
                'ward_id'     => $supplier->ward_id,
            ]
        ];
    }
}