<?php

namespace App\Enums;

enum RoleType: string
{
    case ADMIN = 'ADMIN';
    case USER = 'USER';
    case WAREHOUSE_STAFF = 'WAREHOUSE_STAFF';
    case ORDER_STAFF = 'ORDER_STAFF';

    public function description(): string
    {
        return match ($this) {
            self::ADMIN => 'Administrator',
            self::USER => 'User',
            self::WAREHOUSE_STAFF => 'Warehouse staff',
            self::ORDER_STAFF => 'Order staff',
        };
    }
}
