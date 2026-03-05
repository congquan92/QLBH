<?php

namespace App\Http\Mapper;

use App\Models\Supplier;

class SupplierMapper
{
    public static function toResponse(Supplier $supplier): array
    {
        return [
            'id'            => $supplier->id,
            'name'          => $supplier->name,
            'phone'         => $supplier->phone,
            'status'        => $supplier->status->value,
            'full_address'  => sprintf(
                "%s, %s, %s, %s", 
                $supplier->address, 
                $supplier->ward, 
                $supplier->district, 
                $supplier->province
            ),
            'location' => [
                'province_id' => $supplier->province_id,
                'district_id' => $supplier->district_id,
                'ward_id'     => $supplier->ward_id,
            ]
        ];
    }
}