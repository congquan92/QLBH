"use client";

import { ScheduleApi } from "@/api/admin/schedule.api";
import { AttendanceApi } from "@/api/admin/attendance.api";
import { ExportApi } from "@/api/admin/export.api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { MyScheduleDay } from "@/types/schedule";
import type { AttendanceRecord } from "@/types/attendance";

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
    const weekRange = formatWeekRange(currentDate);
    const [isRecordingAttendance, setIsRecordingAttendance] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);

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

    const fetchTodayAttendance = useCallback(async () => {
        try {
            const res = await AttendanceApi.getHistory({ page: 1, size: 20, sort: "date:desc" });
            const rows = (res as { data?: { data?: AttendanceRecord[] } })?.data?.data ?? [];
            const today = new Date().toISOString().split("T")[0];
            const todayRecord = rows.find((item) => item.date === today) ?? null;
            setTodayAttendance(todayRecord);
        } catch {
            setTodayAttendance(null);
        }
    }, []);

    useEffect(() => {
        void fetchTodayAttendance();
    }, [fetchTodayAttendance]);

    function navigate(direction: "prev" | "next" | "today") {
        setCurrentDate((prev) => {
            if (direction === "today") return new Date();
            const next = new Date(prev);
            next.setDate(next.getDate() + (direction === "next" ? 7 : -7));
            return next;
        });
    }

    async function handleAttendanceRecord() {
        setIsRecordingAttendance(true);
        try {
            const res = await AttendanceApi.record();
            const raw = res as { message?: string; type?: string };
            toast.success(raw?.message ?? "Điểm danh thành công.");
            if (raw?.type === "CHECK_IN") {
                toast.info("Bạn đã check-in. Hãy check-out khi kết thúc ca.");
            } else if (raw?.type === "CHECK_OUT") {
                toast.info("Bạn đã kết thúc ca. Hẹn gặp lại ở ca tiếp theo.");
            }
            await fetchTodayAttendance();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể điểm danh.");
        } finally {
            setIsRecordingAttendance(false);
        }
    }

    async function handleExportMySchedule() {
        setIsExporting(true);
        try {
            const blob = await ExportApi.exportMySchedule({ type: "pdf" });
            ExportApi.downloadBlob(blob, "lich-ca-cua-toi.pdf");
            toast.success("Xuất file lịch làm việc thành công.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể xuất file lịch làm việc.");
        } finally {
            setIsExporting(false);
        }
    }

    const hasCheckedIn = Boolean(todayAttendance?.check_in);
    const hasCheckedOut = Boolean(todayAttendance?.check_out);
    const attendanceActionLabel = hasCheckedIn && !hasCheckedOut ? "Kết thúc ca" : "Điểm danh vào ca";

    return (
        <div className="space-y-5">
            <UScheduleHeader
                currentDate={currentDate}
                weekRange={weekRange}
                onNavigate={navigate}
                isRecordingAttendance={isRecordingAttendance}
                isExporting={isExporting}
                attendanceActionLabel={attendanceActionLabel}
                onAttendanceRecord={() => void handleAttendanceRecord()}
                onExportMySchedule={() => void handleExportMySchedule()}
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
