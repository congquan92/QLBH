<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #333; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #4a90e2; padding-bottom: 10px; }
        .header h2 { margin: 0; text-transform: uppercase; color: #4a90e2; font-size: 18px; }
        
        .info-section { margin-bottom: 20px; background: #f9f9f9; padding: 10px; border-radius: 5px; }
        .info-table { width: 100%; border: none; }
        .info-table td { border: none; text-align: left; padding: 4px; }

        table.schedule-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .schedule-table th { background-color: #f5f7fa; border: 1px solid #dcdfe6; padding: 10px 5px; color: #606266; }
        .schedule-table td { border: 1px solid #dcdfe6; vertical-align: top; padding: 8px; height: 120px; }

        .shift-item {
            background-color: #ecf5ff;
            border-left: 3px solid #409eff;
            margin-bottom: 8px;
            padding: 8px;
            border-radius: 4px;
        }
        .shift-name { font-weight: bold; color: #409eff; display: block; margin-bottom: 3px; font-size: 11px; }
        .shift-time { font-size: 10px; color: #666; font-weight: bold; }
        
        .day-off { background-color: #fafafa; color: #c0c4cc; text-align: center; }
        .off-text { display: block; margin-top: 40px; font-weight: bold; color: #dcdfe6; font-size: 14px; }
        .day-name-label { font-size: 12px; display: block; margin-bottom: 2px; color: #333; }
        .date-label { font-weight: normal; font-size: 10px; color: #909399; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Lịch Làm Việc Cá Nhân</h2>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">{{ $week_range }}</p>
    </div>

    <div class="info-section">
        <table class="info-table">
            <tr>
                <td width="12%"><strong>Nhân viên:</strong></td>
                <td width="38%">{{ $employee }}</td>
                <td width="12%"><strong>Chức vụ:</strong></td>
                <td>{{ $position }}</td>
            </tr>
        </table>
    </div>

    <table class="schedule-table">
        <thead>
            <tr>
                @foreach($week_schedule as $day)
                    <th>
                        <span class="day-name-label">{{ $day['day_name'] }}</span>
                        <span class="date-label">{{ $day['date'] }}</span>
                    </th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            <tr>
                @foreach($week_schedule as $day)
                    @php 
                        $isOff = collect($day['shifts'])->contains('shift_name', 'Nghỉ');
                    @endphp
                    
                    <td class="{{ $isOff ? 'day-off' : '' }}">
                        @foreach($day['shifts'] as $shift)
                            @if($shift['shift_name'] !== 'Nghỉ')
                                <div class="shift-item">
                                    <span class="shift-name">{{ $shift['shift_name'] }}</span>
                                    <span class="shift-time">🕒 {{ $shift['time'] }}</span>
                                </div>
                            @else
                                <span class="off-text">NGHỈ</span>
                            @endif
                        @endforeach
                    </td>
                @endforeach
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 30px; font-size: 10px; color: #999; border-top: 1px dashed #ccc; padding-top: 10px;">
        <p><i>* Ghi chú: Vui lòng có mặt trước ca làm việc 10-15 phút.</i></p>
        <p>Ngày xuất bản: {{ date('d/m/Y H:i') }} | Hệ thống quản lý Shop</p>
    </div>
</body>
</html>