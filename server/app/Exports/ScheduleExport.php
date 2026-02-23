<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ScheduleExport implements FromCollection, WithHeadings
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        // Chuyển mảng dữ liệu thành Collection để Laravel Excel xử lý
        return collect($this->data['weekly_schedule']);
    }

    public function headings(): array
    {
        return [
            'Ngày',
            'Thứ',
            'Tổng nhân viên',
            // Bạn có thể thêm các cột khác tùy ý
        ];
    }
}