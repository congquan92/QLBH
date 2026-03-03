Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Seeding database..." -ForegroundColor Cyan

php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=AppSeeder
php artisan db:seed --class=HolidaySeeder
php artisan db:seed --class=PositionSeeder
php artisan db:seed --class=SalaryConfigSeeder
php artisan db:seed --class=SalaryScaleSeeder
php artisan db:seed --class=ShiftSeeder

Write-Host "Done." -ForegroundColor Green
