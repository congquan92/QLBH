<?php

namespace App\Enums;

enum PaymentType: string
{
    case COD = 'COD';
    case BANK_TRANSFER = 'BANK_TRANSFER';
}
