"use client";

import { cn } from "@/lib/utils";
import type { DailyStaffEmployee } from "@/types/schedule";
import { Users, Briefcase, Coffee, Clock, MapPin } from "lucide-react";

type Props = {
    date: string;
    staff: DailyStaffEmployee[];
};

const SHIFT_COLORS: Record<string, string> = {
    "Ca Sáng": "bg-blue-500",
    "Ca Chiều": "bg-amber-500",
    "Ca Toàn Ngày": "bg-emerald-500",
};

function getShiftDotColor(shiftName: string) {
    return SHIFT_COLORS[shiftName] ?? "bg-violet-500";
}

export function DailyStaffView({ date, staff }: Props) {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    if (!staff || staff.length === 0) {
        return (
            <div className="rounded-xl border bg-card">
                <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <h3 className="font-semibold">Nhân viên làm việc</h3>
                        <p className="text-xs text-muted-foreground capitalize">{formattedDate}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Coffee className="mb-3 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm font-medium text-muted-foreground">Không có nhân viên làm việc</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">Ngày này chưa có lịch phân ca</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Nhân viên làm việc</h3>
                        <p className="text-xs text-muted-foreground capitalize">{formattedDate}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-bold">{staff.length}</span>
                    <span className="text-xs">người</span>
                </div>
            </div>

            {/* Staff Cards Grid */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {staff.map((emp, idx) => (
                    <div
                        key={idx}
                        className="group relative flex items-start gap-3 p-3 rounded-lg border bg-gradient-to-b from-background to-muted/10 hover:shadow-md transition-all hover:border-primary/20"
                    >
                        {/* Avatar placeholder */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                            {emp.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{emp.name}</p>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{emp.position}</span>
                            </div>

                            {/* Shifts */}
                            <div className="mt-2 space-y-1">
                                {emp.shifts?.map((shift, sIdx) => (
                                    <div key={sIdx} className="flex items-center gap-1.5">
                                        <div className={cn("w-2 h-2 rounded-full", getShiftDotColor(shift.name))} />
                                        <span className="text-[11px] font-medium">{shift.name}</span>
                                        <span className="text-[10px] text-muted-foreground ml-auto">
                                            {shift.time?.split(" - ").map((t) => t.slice(0, 5)).join(" – ")}
                                        </span>
                                    </div>
                                )) ?? (
                                    <div className="flex items-center gap-1.5 text-muted-foreground/60">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-[11px]">Chưa có thông tin ca</span>
                                    </div>
                                )}
                            </div>

                            {/* Special badge */}
                            {emp.shifts?.some((s) => s.is_special) && (
                                <span className="inline-flex items-center mt-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                                    Ca đặc biệt
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
