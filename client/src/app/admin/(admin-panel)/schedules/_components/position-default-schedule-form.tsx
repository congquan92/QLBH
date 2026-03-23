"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Position, Shift } from "@/types/admin-crud";
import { BriefcaseBusiness, Loader2, Save, RefreshCw } from "lucide-react";

type Props = {
    positions: Position[];
    shifts: Shift[];
    selectedPositionId: string;
    dayShiftMap: Record<number, string>;
    isLoadingPositionSchedule: boolean;
    isSaving: boolean;
    onPositionChange: (positionId: string) => void;
    onDayShiftChange: (dayOfWeek: number, shiftId: string) => void;
    onLoadCurrentSchedule: () => void;
    onSubmit: () => void;
};

const DAYS_OF_WEEK: Array<{ value: number; label: string }> = [
    { value: 1, label: "Thứ Hai" },
    { value: 2, label: "Thứ Ba" },
    { value: 3, label: "Thứ Tư" },
    { value: 4, label: "Thứ Năm" },
    { value: 5, label: "Thứ Sáu" },
    { value: 6, label: "Thứ Bảy" },
    { value: 0, label: "Chủ Nhật" },
];

function formatSalaryType(value: unknown) {
    const type = String(value ?? "").toUpperCase();
    if (type === "HOURLY") return "Lương theo giờ";
    if (type === "MONTHLY") return "Lương theo tháng";
    return "-";
}

export function PositionDefaultScheduleForm({
    positions,
    shifts,
    selectedPositionId,
    dayShiftMap,
    isLoadingPositionSchedule,
    isSaving,
    onPositionChange,
    onDayShiftChange,
    onLoadCurrentSchedule,
    onSubmit,
}: Props) {
    const selectedDays = Object.values(dayShiftMap).filter((shiftId) => Boolean(shiftId)).length;
    const selectedPosition = positions.find((item) => String(item.id) === selectedPositionId);

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-linear-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        <BriefcaseBusiness className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Cấu hình lịch mặc định theo chức vụ</h3>
                        <p className="text-xs text-muted-foreground">
                            Chọn chức vụ và thiết lập ca mặc định theo từng ngày trong tuần
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onLoadCurrentSchedule}
                    disabled={!selectedPositionId || isLoadingPositionSchedule}
                >
                    {isLoadingPositionSchedule ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Tải lịch hiện tại
                </Button>
            </div>

            <div className="p-4 space-y-4">
                <div className="space-y-2">
                    <Label>Chức vụ</Label>
                    <div className="relative">
                        <select
                            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                            value={selectedPositionId}
                            onChange={(e) => onPositionChange(e.target.value)}
                        >
                            <option value="">Chọn chức vụ</option>
                            {positions.map((position) => (
                                <option key={position.id} value={String(position.id)}>
                                    {String(position.name ?? `Position #${position.id}`)}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                    {selectedPosition && (
                        <p className="text-xs text-muted-foreground">
                            Lương cơ bản: {Number(selectedPosition.base_salary ?? 0).toLocaleString("vi-VN")} VND - {formatSalaryType(selectedPosition.salary_type)}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day.value} className="rounded-lg border p-3 space-y-2">
                            <Label className="text-sm">{day.label}</Label>
                            <div className="relative">
                                <select
                                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                                    value={dayShiftMap[day.value] ?? ""}
                                    onChange={(e) => onDayShiftChange(day.value, e.target.value)}
                                >
                                    <option value="">Nghỉ / Không áp dụng</option>
                                    {shifts.map((shift) => (
                                        <option key={shift.id} value={String(shift.id)}>
                                            {String(shift.name ?? `Shift #${shift.id}`)} ({String(shift.start_time ?? "")} - {String(shift.end_time ?? "")})
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <p className="text-sm text-muted-foreground">
                        Đã chọn {selectedDays}/7 ngày có ca mặc định.
                    </p>
                    <Button onClick={onSubmit} disabled={isSaving || !selectedPositionId}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Lưu lịch mặc định
                    </Button>
                </div>
            </div>
        </div>
    );
}
