<?php

namespace App\Enums;

enum OTPType: string
{
    case PASSWORD_RESET = 'PASSWORD_RESET';
    case VERIFICATION = 'VERIFICATION';
    
    case EMAIL_RESET = "EMAIL_RESET";
    case PHONE_RESET = "PHONE_RESET";

    case TWO_FACTOR_AUTH = "TWO_FACTOR_AUTH";
}
