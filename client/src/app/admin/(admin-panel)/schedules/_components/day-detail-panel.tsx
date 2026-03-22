"use client";

import { cn } from "@/lib/utils";
import type { WeeklyReportDay, WeeklyReportShift } from "@/types/schedule";
import { CalendarDays, Users, Clock, X, Briefcase, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    day: WeeklyReportDay | null;
    onClose: () => void;
};

const DAY_NAMES_VI: Record<string, string> = {
    Monday: "Thứ Hai",
    Tuesday: "Thứ Ba",
    Wednesday: "Thứ Tư",
    Thursday: "Thứ Năm",
    Friday: "Thứ Sáu",
    Saturday: "Thứ Bảy",
    Sunday: "Chủ Nhật",
};

const SHIFT_BG: Record<string, string> = {
    "Ca Sáng": "from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-800",
    "Ca Chiều": "from-amber-500/10 to-amber-500/5 border-amber-200 dark:border-amber-800",
    "Ca Toàn Ngày": "from-emerald-500/10 to-emerald-500/5 border-emerald-200 dark:border-emerald-800",
};

const SHIFT_ACCENT: Record<string, string> = {
    "Ca Sáng": "text-blue-600 dark:text-blue-400",
    "Ca Chiều": "text-amber-600 dark:text-amber-400",
    "Ca Toàn Ngày": "text-emerald-600 dark:text-emerald-400",
};

function ShiftDetail({ shift }: { shift: WeeklyReportShift }) {
    const bg = SHIFT_BG[shift.shift_name] ?? "from-violet-500/10 to-violet-500/5 border-violet-200 dark:border-violet-800";
    const accent = SHIFT_ACCENT[shift.shift_name] ?? "text-violet-600 dark:text-violet-400";

    return (
        <div className={cn("rounded-lg border bg-gradient-to-b p-3", bg)}>
            {/* Shift Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Briefcase className={cn("w-4 h-4", accent)} />
                    <span className={cn("text-sm font-semibold", accent)}>{shift.shift_name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {shift.start_time?.slice(0, 5)} – {shift.end_time?.slice(0, 5)}
                </div>
            </div>

            {/* Employee Count */}
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span className="font-medium">{shift.staff_count}</span> nhân viên
            </div>

            {/* Employee List */}
            {shift.employees && shift.employees.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                    {shift.employees.map((emp, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-2.5 p-2 rounded-md bg-background/60 hover:bg-background transition-colors"
                        >
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                                {emp.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{emp.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{emp.position}</p>
                            </div>
                            {emp.is_special && (
                                <Sparkles className="w-3 h-3 text-violet-500 shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {shift.staff_count === 0 && (
                <p className="mt-2 text-xs text-muted-foreground/60 italic">Chưa có nhân viên</p>
            )}
        </div>
    );
}

export function DayDetailPanel({ day, onClose }: Props) {
    if (!day) return null;

    const dateObj = new Date(day.date);
    const formattedDate = dateObj.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    return (
        <div className="rounded-xl border bg-card overflow-hidden animate-in slide-in-from-right-2 duration-200">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                        <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold">
                            {DAY_NAMES_VI[day.day_name] ?? day.day_name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{formattedDate}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-sm font-bold">{day.total_staff_working}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Shift Details */}
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                {day.shifts?.map((shift) => (
                    <ShiftDetail key={shift.shift_id} shift={shift} />
                ))}

                {(!day.shifts || day.shifts.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                        <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Không có thông tin ca</p>
                    </div>
                )}
            </div>
        </div>
    );
}
