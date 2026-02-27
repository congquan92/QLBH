<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: center; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; }
        .footer { margin-top: 20px; text-align: right; font-style: italic; }
    </style>
</head>
<body>
    <div class="header">
        <h2>BẢNG PHÂN CÔNG LỊCH LÀM VIỆC</h2>
        <p>Từ ngày: {{ $start_date }} đến ngày: {{ $end_date }}</p>
    </div>

    <table>
        <thead>
            <tr>
                @foreach($headers as $header)
                    <th>{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($content as $row)
                <tr>
                    <td style="text-align: left;">{{ $row['full_name'] }}</td>
                    <td>{{ $row['position'] }}</td>
                    <td>{{ $row['day_0'] }}</td>
                    <td>{{ $row['day_1'] }}</td>
                    <td>{{ $row['day_2'] }}</td>
                    <td>{{ $row['day_3'] }}</td>
                    <td>{{ $row['day_4'] }}</td>
                    <td>{{ $row['day_5'] }}</td>
                    <td>{{ $row['day_6'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Ngày xuất file: {{ now()->format('d/m/Y H:i') }}</p>
    </div>
</body>
</html>