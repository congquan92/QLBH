<?php
namespace App\Http\Responses\Position;

class PositionResponse
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $baseSalary,
        public ?string $salaryType,
    ) {}
}
