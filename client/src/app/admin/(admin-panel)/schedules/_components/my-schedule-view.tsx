"use client";

import { cn } from "@/lib/utils";
import type { MyScheduleDay } from "@/types/schedule";
import { User, Clock, Coffee, Briefcase, Sparkles } from "lucide-react";
import { useMemo } from "react";

type Props = {
    employee: string;
    position: string;
    weekSchedule: MyScheduleDay[];
};

const DAY_LABELS_VI: Record<string, string> = {
    Monday: "Thứ Hai",
    Tuesday: "Thứ Ba",
    Wednesday: "Thứ Tư",
    Thursday: "Thứ Năm",
    Friday: "Thứ Sáu",
    Saturday: "Thứ Bảy",
    Sunday: "Chủ Nhật",
};

const SHORT_DAY_VI: Record<string, string> = {
    Monday: "T2",
    Tuesday: "T3",
    Wednesday: "T4",
    Thursday: "T5",
    Friday: "T6",
    Saturday: "T7",
    Sunday: "CN",
};

const TYPE_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    "Mặc định": {
        bg: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
        icon: <Briefcase className="w-3.5 h-3.5" />,
    },
    "Ca đặc biệt": {
        bg: "bg-violet-500",
        text: "text-violet-600 dark:text-violet-400",
        icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    "Nghỉ": {
        bg: "bg-slate-300 dark:bg-slate-600",
        text: "text-slate-500 dark:text-slate-400",
        icon: <Coffee className="w-3.5 h-3.5" />,
    },
};

function getTypeStyle(type: string) {
    return TYPE_STYLES[type] ?? TYPE_STYLES["Mặc định"];
}

export function MyScheduleView({ employee, position, weekSchedule }: Props) {
    const today = useMemo(() => new Date().toISOString().split("T")[0], []);

    return (
        <div className="space-y-4">
            {/* Employee info card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                    <User className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-lg font-bold">{employee}</h2>
                    <p className="text-sm text-muted-foreground">{position}</p>
                </div>
            </div>

            {/* Weekly Timeline - giao diện dạng timeline dọc */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="grid grid-cols-7 divide-x">
                    {weekSchedule.map((day) => {
                        const isToday = day.date === today;
                        const isWeekend = day.day_name === "Saturday" || day.day_name === "Sunday";
                        const isOff = day.shifts?.every((s) => s.type === "Nghỉ");
                        const dateObj = new Date(day.date);
                        const dayNum = dateObj.getDate();

                        return (
                            <div
                                key={day.date}
                                className={cn(
                                    "flex flex-col min-h-[300px] transition-colors",
                                    isWeekend && "bg-muted/30",
                                    isToday && "bg-primary/[0.03]"
                                )}
                            >
                                {/* Day Header */}
                                <div
                                    className={cn(
                                        "flex flex-col items-center py-3 border-b",
                                        isToday && "bg-primary/5"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "text-[11px] font-medium uppercase tracking-wider",
                                            isToday ? "text-primary" : "text-muted-foreground",
                                            isWeekend && !isToday && "text-rose-500"
                                        )}
                                    >
                                        {SHORT_DAY_VI[day.day_name] ?? day.day_name}
                                    </span>
                                    <span
                                        className={cn(
                                            "flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold mt-1",
                                            isToday && "bg-primary text-primary-foreground",
                                            !isToday && "text-foreground"
                                        )}
                                    >
                                        {dayNum}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5">
                                        {DAY_LABELS_VI[day.day_name]}
                                    </span>
                                </div>

                                {/* Shifts */}
                                <div className="flex-1 p-2 space-y-2">
                                    {isOff ? (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40">
                                            <Coffee className="w-6 h-6 mb-1.5" />
                                            <span className="text-xs font-medium">Nghỉ</span>
                                        </div>
                                    ) : (
                                        day.shifts?.map((shift, idx) => {
                                            if (shift.type === "Nghỉ") return null;
                                            const style = getTypeStyle(shift.type);
                                            const [startTime, endTime] = shift.time.split(" - ");

                                            return (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "relative rounded-lg border p-2.5 transition-all hover:shadow-md group",
                                                        "bg-gradient-to-b from-background to-muted/20",
                                                        "border-l-[3px]",
                                                        shift.type === "Mặc định" && "border-l-emerald-500",
                                                        shift.type === "Ca đặc biệt" && "border-l-violet-500"
                                                    )}
                                                >
                                                    {/* Shift name */}
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={cn("flex items-center", style.text)}>
                                                            {style.icon}
                                                        </div>
                                                        <span className={cn("text-[11px] font-semibold", style.text)}>
                                                            {shift.shift_name}
                                                        </span>
                                                    </div>

                                                    {/* Time */}
                                                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{startTime?.slice(0, 5)}</span>
                                                        <span>–</span>
                                                        <span>{endTime?.slice(0, 5)}</span>
                                                    </div>

                                                    {/* Type Badge */}
                                                    <div className="mt-2">
                                                        <span
                                                            className={cn(
                                                                "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium",
                                                                shift.type === "Mặc định" &&
                                                                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                                                                shift.type === "Ca đặc biệt" &&
                                                                    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                                                            )}
                                                        >
                                                            {shift.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
