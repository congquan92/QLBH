<?php
namespace App\Http\Mapper;

use App\Http\Responses\SalaryConfig\SalaryConfigResponse;
use App\Models\SalaryConfig;
class SalaryConfigMapper{
    public static function toSalaryConfigMapper(SalaryConfig $salaryConfig){
        return new SalaryConfigResponse(
            $salaryConfig->id,
            $salaryConfig->rule_name,
            $salaryConfig->employee_type->value,
            $salaryConfig->multiplier,
            $salaryConfig->is_holiday
        );
    }
}