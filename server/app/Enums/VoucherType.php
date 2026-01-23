<?php

namespace App\Enums;

enum VoucherType: string
{
    case PERCENTAGE = 'PERCENTAGE';
    case FIXED_AMOUNT = 'FIXED_AMOUNT';

    case FREESHIP = "FREESHIP";

}
