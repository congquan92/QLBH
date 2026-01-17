<?php

namespace App\Enums;

enum VerificationMethod: string
{
    case EMAIL = 'EMAIL';
    case PHONE = 'PHONE';
}
