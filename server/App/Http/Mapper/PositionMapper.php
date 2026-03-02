<?php

namespace App\Http\Mapper;

use App\Models\Position;

class PositionMapper
{
 
    public static function toBaseResponse(Position $position): array
    {
        return [
            'id' => $position->id,
            'name' => $position->name,
            'base_salary' => $position->base_salary,
            'salary_type' => $position->salary_type,
            'created_at' => $position->created_at?->format('Y-m-d H:i:s'),
            'employee_count' => $position->currentEmployees()->count(),
        ];
    }
}