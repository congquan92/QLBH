"use client";

import { cn } from "@/lib/utils";
import type { WeeklyReportDay, WeeklyReportShift } from "@/types/schedule";
import { Users, Briefcase, Coffee } from "lucide-react";
import { useMemo } from "react";

type Props = {
    weeklySchedule: WeeklyReportDay[];
    selectedDate: string;
    onSelectDate: (date: string) => void;
};

/** Danh sách tên thứ tiếng Việt */
const DAY_NAMES_VI: Record<string, string> = {
    Monday: "T2",
    Tuesday: "T3",
    Wednesday: "T4",
    Thursday: "T5",
    Friday: "T6",
    Saturday: "T7",
    Sunday: "CN",
};

const FULL_DAY_NAMES_VI: Record<string, string> = {
    Monday: "Thứ Hai",
    Tuesday: "Thứ Ba",
    Wednesday: "Thứ Tư",
    Thursday: "Thứ Năm",
    Friday: "Thứ Sáu",
    Saturday: "Thứ Bảy",
    Sunday: "Chủ Nhật",
};

/** Màu sắc cho từng ca */
const SHIFT_COLORS: Record<string, { bg: string; border: string; text: string; dotBg: string }> = {
    "Ca Sáng": {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        border: "border-l-blue-500",
        text: "text-blue-700 dark:text-blue-300",
        dotBg: "bg-blue-500",
    },
    "Ca Chiều": {
        bg: "bg-amber-50 dark:bg-amber-950/30",
        border: "border-l-amber-500",
        text: "text-amber-700 dark:text-amber-300",
        dotBg: "bg-amber-500",
    },
    "Ca Toàn Ngày": {
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        border: "border-l-emerald-500",
        text: "text-emerald-700 dark:text-emerald-300",
        dotBg: "bg-emerald-500",
    },
};

const DEFAULT_SHIFT_COLOR = {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-l-violet-500",
    text: "text-violet-700 dark:text-violet-300",
    dotBg: "bg-violet-500",
};

function getShiftColor(shiftName: string) {
    return SHIFT_COLORS[shiftName] ?? DEFAULT_SHIFT_COLOR;
}

function ShiftCard({ shift }: { shift: WeeklyReportShift }) {
    const color = getShiftColor(shift.shift_name);
    const hasEmployees = shift.staff_count > 0;

    return (
        <div
            className={cn(
                "rounded-md border-l-[3px] px-2 py-1.5 transition-all hover:shadow-sm cursor-default",
                color.bg,
                color.border
            )}
        >
            <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", color.dotBg)} />
                    <span className={cn("text-[11px] font-semibold truncate", color.text)}>
                        {shift.shift_name}
                    </span>
                </div>
                {hasEmployees && (
                    <span className={cn("text-[10px] font-bold shrink-0", color.text)}>
                        {shift.staff_count}
                    </span>
                )}
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">
                {shift.start_time?.slice(0, 5)} – {shift.end_time?.slice(0, 5)}
            </div>
            {hasEmployees && shift.employees?.length > 0 && (
                <div className="mt-1 space-y-0.5">
                    {shift.employees.slice(0, 3).map((emp, idx) => (
                        <div key={idx} className="text-[10px] text-muted-foreground truncate">
                            • {emp.name}
                        </div>
                    ))}
                    {shift.employees.length > 3 && (
                        <div className={cn("text-[10px] font-medium", color.text)}>
                            +{shift.employees.length - 3} người khác
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function WeeklyCalendarGrid({ weeklySchedule, selectedDate, onSelectDate }: Props) {
    const today = useMemo(() => new Date().toISOString().split("T")[0], []);

    if (!weeklySchedule || weeklySchedule.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Coffee className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Không có dữ liệu lịch làm việc</p>
                <p className="mt-1 text-xs text-muted-foreground/70">Hãy chọn ngày khác hoặc thử lại</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 min-h-[520px]">
                {weeklySchedule.map((day, idx) => {
                    const isToday = day.date === today;
                    const isSelected = day.date === selectedDate;
                    const isWeekend = day.day_name === "Saturday" || day.day_name === "Sunday";
                    const dateObj = new Date(day.date);
                    const dayNumber = dateObj.getDate();
                    const activShifts = day.shifts?.filter((s) => s.staff_count > 0) || [];

                    return (
                        <div
                            key={day.date}
                            className={cn(
                                "flex flex-col border-r last:border-r-0 cursor-pointer transition-colors",
                                isSelected && "bg-primary/[0.03]",
                                isWeekend && "bg-muted/30",
                                idx < 7 && "border-b-0"
                            )}
                            onClick={() => onSelectDate(day.date)}
                        >
                            {/* Day Header */}
                            <div
                                className={cn(
                                    "sticky top-0 z-10 flex flex-col items-center py-2 border-b",
                                    isToday && "bg-primary/5"
                                )}
                            >
                                <span
                                    className={cn(
                                        "text-[11px] font-medium uppercase tracking-wide",
                                        isToday ? "text-primary" : "text-muted-foreground",
                                        isWeekend && "text-rose-500 dark:text-rose-400"
                                    )}
                                >
                                    {DAY_NAMES_VI[day.day_name] ?? day.day_name}
                                </span>
                                <span
                                    className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mt-0.5 transition-colors",
                                        isToday && "bg-primary text-primary-foreground",
                                        isSelected && !isToday && "bg-primary/10 text-primary",
                                        !isToday && !isSelected && "text-foreground"
                                    )}
                                >
                                    {dayNumber}
                                </span>
                                {/* Staff count badge */}
                                <div
                                    className={cn(
                                        "flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                                        day.total_staff_working > 0
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    <Users className="w-3 h-3" />
                                    {day.total_staff_working}
                                </div>
                            </div>

                            {/* Shift Events */}
                            <div className="flex-1 p-1.5 space-y-1 overflow-y-auto">
                                {activShifts.length > 0
                                    ? activShifts.map((shift) => (
                                          <ShiftCard key={shift.shift_id} shift={shift} />
                                      ))
                                    : day.shifts?.map((shift) => (
                                          <ShiftCard key={shift.shift_id} shift={shift} />
                                      ))}

                                {day.total_staff_working === 0 && (!day.shifts || day.shifts.length === 0) && (
                                    <div className="flex flex-col items-center justify-center h-full py-4 text-muted-foreground/40">
                                        <Briefcase className="w-5 h-5 mb-1" />
                                        <span className="text-[10px]">Nghỉ</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
