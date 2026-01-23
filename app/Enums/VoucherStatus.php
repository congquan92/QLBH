<?php

namespace App\Enums;

enum VoucherStatus: string
{
    case ACTIVE = 'ACTIVE';
    case EXPIRED = 'EXPIRED';

    case DISABLED = "DISABLED";

}
