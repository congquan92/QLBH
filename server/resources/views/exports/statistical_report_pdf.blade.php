<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>{{ $title ?? 'Bao cao thong ke' }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #0f172a;
            margin: 12px;
            line-height: 1.35;
        }
        .report-header {
            background: #0f172a;
            color: #f8fafc;
            border-radius: 8px;
            padding: 12px 14px;
            margin-bottom: 12px;
        }
        h1 {
            margin: 0;
            font-size: 18px;
        }
        .meta {
            margin-bottom: 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 10px;
        }
        .meta-row {
            margin-bottom: 4px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #d1d5db;
            padding: 7px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background: #e2e8f0;
            color: #0f172a;
        }
        tbody tr:nth-child(even) {
            background: #f8fafc;
        }
        .group-cell {
            font-weight: 700;
            color: #0f172a;
        }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>{{ $title ?? 'Bao cao thong ke' }}</h1>
    </div>

    @if (!empty($meta))
        <div class="meta">
            @foreach ($meta as $key => $value)
                <div class="meta-row"><strong>{{ $key }}:</strong> {{ $value }}</div>
            @endforeach
        </div>
    @endif

    <table>
        <thead>
            <tr>
                @foreach (($headers ?? []) as $header)
                    <th>{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse (($rows ?? []) as $row)
                <tr>
                    @foreach ($row as $index => $cell)
                        <td class="{{ $index === 0 ? 'group-cell' : '' }}">{{ is_scalar($cell) ? $cell : json_encode($cell) }}</td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ max(1, count($headers ?? [])) }}">Khong co du lieu</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
