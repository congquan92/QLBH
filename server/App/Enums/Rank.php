<?php

namespace App\Enums;

use Ramsey\Uuid\Type\Decimal;

enum Rank: string
{
    case BRONZE   = 'BRONZE';
    case SILVER   = 'SILVER';
    case GOLD     = 'GOLD';
    case PLATINUM = 'PLATINUM';

    public function minSpent(): string
    {
        return match ($this) {
            self::BRONZE   => '0',
            self::SILVER   => '1000000',
            self::GOLD     => '5000000',
            self::PLATINUM => '10000000',
        };
    }

    /**
     * Xác định rank dựa trên tổng chi tiêu
     */
    public static function fromTotalSpent(string|int|float $totalSpent): self
    {
        $totalSpent = (float) $totalSpent;

        $result = self::BRONZE;

        foreach (self::cases() as $rank) {
            if ($totalSpent >= (float) $rank->minSpent()) {
                $result = $rank;
            }
        }

        return $result;
    }
}
