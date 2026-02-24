<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class PersonalScheduleExport implements FromCollection, WithHeadings
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return collect($this->data['schedule']);
    }

    public function headings(): array
    {
        return [
            'Ngày',
            'Thứ',
            'Ca làm việc',
            'Thời gian',
            'Loại ca'
        ];
    }
}