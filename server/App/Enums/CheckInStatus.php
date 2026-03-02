<?php

namespace App\Enums;

enum CheckInStatus: string
{
    case PRESENT = 'PRESENT';
    case LATE = 'LATE';

    case OT = 'OT';
}
