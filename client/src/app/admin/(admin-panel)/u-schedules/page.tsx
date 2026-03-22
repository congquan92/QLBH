"use client";

import { ScheduleApi } from "@/api/admin/schedule.api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { MyScheduleDay } from "@/types/schedule";

import { MyScheduleView } from "./_components/my-schedule-view";
import { UScheduleHeader } from "./_components/u-schedule-header";
import { MyScheduleSkeleton } from "./_components/u-schedule-skeletons";

/** Helpers để tính tuần */
function getMonday(d: Date) {
    const copy = new Date(d);
    const day = copy.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + diff);
    return copy;
}

function formatWeekRange(d: Date) {
    const monday = getMonday(d);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (dt: Date) =>
        dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `Tuần ${fmt(monday)} – ${fmt(sunday)}`;
}

export default function UserSchedulePage() {
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [myScheduleData, setMyScheduleData] = useState<{
        employee: string;
        position: string;
        week_schedule: MyScheduleDay[];
    } | null>(null);
    const [weekRange, setWeekRange] = useState("");

    const dateStr = currentDate.toISOString().split("T")[0];

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await ScheduleApi.getMySchedule(dateStr);
            const raw = res as unknown as {
                status: string;
                employee: string;
                position: string;
                week_schedule: MyScheduleDay[];
            };
            setMyScheduleData({
                employee: raw.employee ?? "",
                position: raw.position ?? "",
                week_schedule: raw.week_schedule ?? [],
            });
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Không thể tải dữ liệu lịch làm việc"
            );
        } finally {
            setIsLoading(false);
        }
    }, [dateStr]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    function navigate(direction: "prev" | "next" | "today") {
        setCurrentDate((prev) => {
            if (direction === "today") return new Date();
            const next = new Date(prev);
            next.setDate(next.getDate() + (direction === "next" ? 7 : -7));
            return next;
        });
    }

    return (
        <div className="space-y-5">
            <UScheduleHeader
                currentDate={currentDate}
                weekRange={weekRange || formatWeekRange(currentDate)}
                onNavigate={navigate}
            />

            {isLoading ? (
                <MyScheduleSkeleton />
            ) : (
                myScheduleData && (
                    <MyScheduleView
                        employee={myScheduleData.employee}
                        position={myScheduleData.position}
                        weekSchedule={myScheduleData.week_schedule}
                    />
                )
            )}
        </div>
    );
}
