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
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

         $this->call([
            \Database\Seeders\PermissionSeeder::class,
            \Database\Seeders\RoleSeeder::class,
            \Database\Seeders\AppSeeder::class,
            // các seeder còn lại...
            \Database\Seeders\SalaryScaleSeeder::class,
            \Database\Seeders\SalaryConfigSeeder::class,
            \Database\Seeders\ShiftSeeder::class,
            \Database\Seeders\PositionSeeder::class,
            \Database\Seeders\HolidaySeeder::class,
        ]);

    }
}
