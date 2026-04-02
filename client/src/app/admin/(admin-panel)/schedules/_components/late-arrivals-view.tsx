"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, Loader2, TriangleAlert } from "lucide-react";

type LateArrivalItem = {
    date: string;
    user_id: number;
    full_name: string;
    position: string;
    shift_name: string;
    shift_time: string;
    check_in: string;
    late_minutes: string | number;
};

type TimeRange = "THIS_WEEK" | "LAST_WEEK" | "THIS_MONTH" | "LAST_MONTH";

type Props = {
    timeRange: TimeRange;
    label: string;
    records: LateArrivalItem[];
    isLoading: boolean;
    isExporting: boolean;
    onTimeRangeChange: (value: TimeRange) => void;
    onExport: () => void;
};

export function LateArrivalsView({
    timeRange,
    label,
    records,
    isLoading,
    isExporting,
    onTimeRangeChange,
    onExport,
}: Props) {
    const formatLateMinutesVi = (value: string | number): string => {
        const raw = String(value ?? "").trim();
        if (!raw) return "0 phút";

        const match = raw.match(/-?\d+(?:\.\d+)?/);
        if (!match) return raw;

        const numeric = Number(match[0]);
        if (!Number.isFinite(numeric)) return raw;

        const totalSeconds = Math.max(0, Math.round(Math.abs(numeric) * 60));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const parts: string[] = [];
        if (hours > 0) parts.push(`${hours} giờ`);
        if (minutes > 0) parts.push(`${minutes} phút`);
        if (hours === 0 && minutes === 0) parts.push(`${seconds} giây`);

        return parts.join(" ");
    };

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b bg-muted/30">
                <div>
                    <h3 className="font-semibold flex items-center gap-2">
                        <TriangleAlert className="h-4 w-4 text-amber-500" />
                        Danh sách đi trễ
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
                <div className="flex items-end gap-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Khoảng thời gian</Label>
                        <select
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            value={timeRange}
                            onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
                        >
                            <option value="THIS_WEEK">Tuần này</option>
                            <option value="LAST_WEEK">Tuần trước</option>
                            <option value="THIS_MONTH">Tháng này</option>
                            <option value="LAST_MONTH">Tháng trước</option>
                        </select>
                    </div>
                    <Button variant="outline" onClick={onExport} disabled={isExporting}>
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Xuất Excel
                    </Button>
                </div>
            </div>

            <div className="p-4">
                {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                        Đang tải danh sách đi trễ...
                    </div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted">
                                <tr>
                                    <th className="px-4 py-3">Ngày</th>
                                    <th className="px-4 py-3">Nhân viên</th>
                                    <th className="px-4 py-3">Chức vụ</th>
                                    <th className="px-4 py-3">Ca</th>
                                    <th className="px-4 py-3">Giờ ca</th>
                                    <th className="px-4 py-3">Check-in</th>
                                    <th className="px-4 py-3">Đi trễ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr>
                                        <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                                            Không có dữ liệu đi trễ trong khoảng thời gian này.
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((item, index) => (
                                        <tr key={`${item.user_id}-${item.date}-${index}`} className="border-b hover:bg-muted/50">
                                            <td className="px-4 py-3">{new Date(item.date).toLocaleDateString("vi-VN")}</td>
                                            <td className="px-4 py-3 font-medium">{item.full_name} (#{item.user_id})</td>
                                            <td className="px-4 py-3">{item.position}</td>
                                            <td className="px-4 py-3">{item.shift_name}</td>
                                            <td className="px-4 py-3">{item.shift_time}</td>
                                            <td className="px-4 py-3">{item.check_in}</td>
                                            <td className="px-4 py-3 text-amber-600 font-semibold">{formatLateMinutesVi(item.late_minutes)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
