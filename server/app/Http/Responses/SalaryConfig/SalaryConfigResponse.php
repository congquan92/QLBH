<?php
namespace App\Http\Responses\SalaryConfig;

class SalaryConfigResponse {
    public function __construct(
        public int $id,
        public string $rule_name,
        public string $employee_type,
        public string $multiplier,
        public bool $is_holiday
    ) {}
}