<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ScheduleExport implements FromCollection, WithHeadings, ShouldAutoSize
{
    protected $data;

    public function __construct($data)
    {
        // $data ở đây là mảng chứa: 'start_date', 'end_date', 'headers', 'content'
        $this->data = $data;
    }

    public function collection()
    {
        // Trả về key 'content' (đây là mảng các dòng dữ liệu nhân viên)
        // Dùng collect() để biến mảng thành Collection theo yêu cầu của FromCollection
        return collect($this->data['content']);
    }

    public function headings(): array
    {
        // Sử dụng luôn mảng 'headers' sinh ra từ Service để tiêu đề khớp với ngày tháng thực tế
        return $this->data['headers'];
    }
}