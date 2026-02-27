<?php
namespace App\Http\Service;

use App\Http\Service\ScheduleService;
use App\Models\User;
use Carbon\Carbon;

class ExportService
{
    protected $scheduleService;

    public function __construct(ScheduleService $scheduleService)
    {
        $this->scheduleService = $scheduleService;
    }

    public function getExportData($startDate)
    {
        $start = Carbon::parse($startDate)->startOfWeek(); // Luôn bắt đầu từ Thứ 2 của tuần đó
        $end = $start->copy()->addDays(6);

        $users = User::with('position')->where('status', 'ACTIVE')->get();

        $data = [];
        foreach ($users as $user) {
            $row = [
                'full_name' => $user->full_name,
                'position' => $user->position->name ?? 'N/A',
            ];

            // Chạy vòng lặp 7 ngày trong tuần
            for ($i = 0; $i < 7; $i++) {
                $currentDate = $start->copy()->addDays($i);
                $shift = $this->scheduleService->getEffectiveShift($user, $currentDate->format('Y-m-d'));

                $dayKey = 'day_' . $i; // day_0, day_1...
                $row[$dayKey] = $shift ? "{$shift->start_time} - {$shift->end_time}" : 'Nghỉ';
            }
            $data[] = $row;
        }

        return [
            'start_date' => $start->format('d/m/Y'),
            'end_date' => $end->format('d/m/Y'),
            'headers' => $this->generateHeaders($start),
            'content' => $data
        ];
    }

    private function generateHeaders($start)
    {
        $headers = ['Nhân viên', 'Chức vụ'];
        for ($i = 0; $i < 7; $i++) {
            $date = $start->copy()->addDays($i);
            $headers[] = $date->translatedFormat('l') . " (" . $date->format('d/m') . ")";
        }
        return $headers;
    }

    // Trong App\Services\ExportService.php

    public function getPersonalExportData($user, $date)
    {
        $start = Carbon::parse($date)->startOfWeek();
        $end = $start->copy()->addDays(6);

        $schedule = [];
        for ($i = 0; $i < 7; $i++) {
            $currentDate = $start->copy()->addDays($i);
            $shift = $this->scheduleService->getEffectiveShift($user, $currentDate->format('Y-m-d'));

            $schedule[] = [
                'date' => $currentDate->format('d/m'),
                'day_name' => $currentDate->translatedFormat('l'),
                'shifts' => [
                    [
                        'shift_name' => $shift ? $shift->name : 'Nghỉ',
                        'time' => $shift ? "{$shift->start_time} - {$shift->end_time}" : '-',
                    ]
                ]
            ];
        }

        return [
            'employee' => $user->full_name, 
            'position' => $user->position->name ?? 'N/A',
            'week_range' => "Từ {$start->format('d/m/Y')} đến {$end->format('d/m/Y')}",
            'week_schedule' => $schedule 
        ];
    }
}