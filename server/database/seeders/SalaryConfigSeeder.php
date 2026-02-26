<?php

namespace Database\Seeders;

use App\Enums\EmploymentType;
use App\Models\SalaryConfig;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SalaryConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $configs = [
            [
                'rule_name' => 'Lương tăng ca ngày lễ - FULLTIME',
                'employee_type' => EmploymentType::FULLTIME->value,
                'multiplier' => 3.0,
                'is_holiday' => true
            ],
            [
                'rule_name' => 'Lương tăng ca ngày lễ - PARTTIME',
                'employee_type' => EmploymentType::PARTTIME->value,
                'multiplier' => 2.0,
                'is_holiday' => true
            ],
        ];

        foreach ($configs as $config) {
            SalaryConfig::create($config);
        }
    }
}
