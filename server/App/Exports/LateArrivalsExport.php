<?php
namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class LateArrivalsExport implements FromCollection, WithHeadings
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return collect($this->data);
    }

    public function headings(): array
    {
        return [
            'Ngày',
            'Mã nhân viên',
            'Nhân viên',
            'Chức vụ',
            'Tên ca',
            'Khung giờ ca',
            'Giờ Check-in',
            'Số phút trễ'
        ];
    }
}