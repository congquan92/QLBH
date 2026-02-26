<?php

namespace Database\Seeders;

use App\Models\SalaryScale;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SalaryScaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
   public function run()
    {
        $scales = [
            [
                'name' => 'Bậc 1: Nhân viên thử việc / Part-time',
                'years_of_experience' => 0,
                'coefficient' => 1.0
            ],
            [
                'name' => 'Bậc 2: Nhân viên chính thức (Dưới 1 năm)',
                'years_of_experience' => 1,
                'coefficient' => 1.15
            ],
            [
                'name' => 'Bậc 3: Nhân viên có kinh nghiệm (1-3 năm)',
                'years_of_experience' => 2,
                'coefficient' => 1.3
            ],
            [
                'name' => 'Bậc 4: Nhóm trưởng / Giám sát ca',
                'years_of_experience' => 3,
                'coefficient' => 1.5
            ],
            [
                'name' => 'Bậc 5: Quản lý cửa hàng / Cửa hàng trưởng',
                'years_of_experience' => 5,
                'coefficient' => 2.0
            ],
            [
                'name' => 'Bậc 6: Quản lý khu vực / Điều hành chuỗi',
                'years_of_experience' => 8,
                'coefficient' => 2.8
            ],
        ];

        foreach ($scales as $scale) {
            SalaryScale::create($scale);
        }
    }
}
