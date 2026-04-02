<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            // 1. RBAC core
            PermissionSeeder::class,
            RoleSeeder::class,

            // 2. HR baselines (must run before PositionSeeder)
            SalaryScaleSeeder::class,
            SalaryConfigSeeder::class,
            ShiftSeeder::class,

            // 3. Core accounts + positions + job histories (tightly coupled)
            AppSeeder::class,
            PositionSeeder::class,

            // 4. Calendar
            HolidaySeeder::class,

            // 5. Catalog: suppliers → categories → products → variants → images
            CatalogSeeder::class,

            // 6. Sales: customers → orders → vouchers → reviews → imports
            CustomerSeeder::class,
            // OrderSeeder::class,
            VoucherSeeder::class,
            // ReviewSeeder::class,
            // ImportSeeder::class,

            // 7. HR activity: shift assignments + attendances
            WorkforceSeeder::class,
        ]);
    }
}
