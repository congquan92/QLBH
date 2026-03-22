<?php

namespace Database\Seeders;

use App\Enums\Gender;
use App\Enums\UserStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * CustomerSeeder — tạo địa chỉ giao hàng cho các khách hàng đã có trong AppSeeder.
 */
class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            [
                'username' => 'khach_01',
                'addresses' => [
                    [
                        'customer_name' => 'Phạm Thị Thu',
                        'phone_number'  => '0904567890',
                        'address'       => '12 Lê Lợi',
                        'ward'          => 'Phường Bến Nghé',
                        'district'      => 'Quận 1',
                        'province'      => 'Hồ Chí Minh',
                        'province_id'   => 209, 'district_id' => 1442, 'ward_id' => 21232,
                        'address_type'  => 'HOME',
                        'is_default'    => true,
                    ],
                ],
            ],
            [
                'username' => 'khach_02',
                'addresses' => [
                    [
                        'customer_name' => 'Nguyễn Văn Bình',
                        'phone_number'  => '0905678901',
                        'address'       => '45 Trần Hưng Đạo',
                        'ward'          => 'Phường Cầu Ông Lãnh',
                        'district'      => 'Quận 1',
                        'province'      => 'Hồ Chí Minh',
                        'province_id'   => 209, 'district_id' => 1442, 'ward_id' => 21235,
                        'address_type'  => 'HOME',
                        'is_default'    => true,
                    ],
                    [
                        'customer_name' => 'Nguyễn Văn Bình',
                        'phone_number'  => '0905678901',
                        'address'       => '99 Điện Biên Phủ',
                        'ward'          => 'Phường 15',
                        'district'      => 'Quận Bình Thạnh',
                        'province'      => 'Hồ Chí Minh',
                        'province_id'   => 209, 'district_id' => 1446, 'ward_id' => 21328,
                        'address_type'  => 'OFFICE',
                        'is_default'    => false,
                    ],
                ],
            ],
            [
                'username' => 'khach_03',
                'addresses' => [
                    [
                        'customer_name' => 'Hoàng Thị Lan',
                        'phone_number'  => '0906789012',
                        'address'       => '200 Hai Bà Trưng',
                        'ward'          => 'Phường Tân Định',
                        'district'      => 'Quận 1',
                        'province'      => 'Hồ Chí Minh',
                        'province_id'   => 209, 'district_id' => 1442, 'ward_id' => 21244,
                        'address_type'  => 'HOME',
                        'is_default'    => true,
                    ],
                ],
            ],
        ];

        foreach ($customers as $cust) {
            $userId = DB::table('users')->where('username', $cust['username'])->value('id');
            if (!$userId) continue;

            foreach ($cust['addresses'] as $addr) {
                DB::table('addresses')->updateOrInsert(
                    ['user_id' => $userId, 'address' => $addr['address']],
                    array_merge($addr, ['user_id' => $userId, 'updated_at' => now(), 'created_at' => now()])
                );

                $addressId = DB::table('addresses')
                    ->where('user_id', $userId)
                    ->where('address', $addr['address'])
                    ->value('id');

                if ($addressId) {
                    DB::table('user_address')->updateOrInsert(
                        ['user_id' => $userId, 'address_id' => $addressId],
                        ['is_default' => $addr['is_default'], 'updated_at' => now(), 'created_at' => now()]
                    );
                }
            }
        }
    }
}
