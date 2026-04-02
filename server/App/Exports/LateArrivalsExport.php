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
        return collect($this->data)->map(function ($item) {
            $row = (array) $item;

            return [
                'date' => $row['date'] ?? '-',
                'user_id' => $row['user_id'] ?? '-',
                'full_name' => $row['full_name'] ?? '-',
                'position' => $row['position'] ?? 'N/A',
                'shift_name' => $row['shift_name'] ?? 'N/A',
                'shift_time' => $row['shift_time'] ?? '-',
                'check_in' => $row['check_in'] ?? '-',
                'late_minutes' => $this->formatLateDurationVi($row['late_minutes'] ?? null),
            ];
        });
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
            'Thời gian trễ'
        ];
    }

    private function formatLateDurationVi($value): string
    {
        if ($value === null || $value === '') {
            return 'N/A';
        }

        if (is_string($value) && strtoupper(trim($value)) === 'N/A') {
            return 'N/A';
        }

        if (is_numeric($value)) {
            $minutes = (float) $value;
        } elseif (is_string($value) && preg_match('/-?\d+(?:\.\d+)?/', $value, $matches)) {
            $minutes = (float) $matches[0];
        } else {
            return (string) $value;
        }

        $totalSeconds = (int) round(abs($minutes) * 60);

        if ($totalSeconds <= 0) {
            return '0 giây';
        }

        $hours = intdiv($totalSeconds, 3600);
        $remain = $totalSeconds % 3600;
        $mins = intdiv($remain, 60);
        $secs = $remain % 60;

        $parts = [];
        if ($hours > 0) {
            $parts[] = $hours . ' giờ';
        }
        if ($mins > 0) {
            $parts[] = $mins . ' phút';
        }
        if ($secs > 0 && $hours === 0) {
            $parts[] = $secs . ' giây';
        }

        return implode(' ', $parts);
    }
}