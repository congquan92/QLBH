<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // RBAC and core accounts
            \Database\Seeders\PermissionSeeder::class,
            \Database\Seeders\RoleSeeder::class,
            \Database\Seeders\AppSeeder::class,

            // HR / payroll baseline
            \Database\Seeders\SalaryScaleSeeder::class,
            \Database\Seeders\SalaryConfigSeeder::class,
            \Database\Seeders\ShiftSeeder::class,
            \Database\Seeders\PositionSeeder::class,
            \Database\Seeders\HolidaySeeder::class,

            // Sales demo data by domain
            \Database\Seeders\CatalogDemoSeeder::class,
            \Database\Seeders\ProductAttributeDemoSeeder::class,
            \Database\Seeders\CustomerDemoSeeder::class,
            \Database\Seeders\OrderDemoSeeder::class,
            \Database\Seeders\VoucherDemoSeeder::class,
            \Database\Seeders\ReviewDemoSeeder::class,
            \Database\Seeders\ImportDemoSeeder::class,
            \Database\Seeders\WorkforceDemoSeeder::class,
        ]);
    }
}
