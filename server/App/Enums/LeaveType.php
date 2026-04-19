<?php

namespace App\Enums;

enum LeaveType: string
{
    case ANNUAL = 'ANNUAL';
    case SICK_MATERNITY = 'SICK_MATERNITY';
    case RESIGNATION = 'RESIGNATION';

    public function label(): string
    {
        return match ($this) {
            self::ANNUAL => 'Nghi phep',
            self::SICK_MATERNITY => 'Om dau / Thai san',
            self::RESIGNATION => 'Nghi viec',
        };
    }
}
