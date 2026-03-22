"use client";

import { ScheduleApi } from "@/api/admin/schedule.api";
import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { UserApi } from "@/api/user.api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Shift } from "@/types/admin-crud";
import type {
    WeeklyReportDay,
    DailyStaffEmployee,
} from "@/types/schedule";
import type { UserProfile } from "@/types/user";

import { ScheduleHeader } from "./_components/schedule-header";
import { WeeklyCalendarGrid } from "./_components/weekly-calendar-grid";
import { DailyStaffView } from "./_components/daily-staff-view";
import { DayDetailPanel } from "./_components/day-detail-panel";
import { AssignShiftForm } from "./_components/assign-shift-form";
import { CalendarSkeleton, DailyStaffSkeleton } from "./_components/schedule-skeletons";

type ViewMode = "weekly-report" | "daily-staff" | "assign";

type AssignForm = {
    user_id: string;
    shift_id: string;
    date: string;
};

const emptyAssignForm: AssignForm = {
    user_id: "",
    shift_id: "",
    date: new Date().toISOString().split("T")[0],
};

/** Helpers để tính tuần */
function getMonday(d: Date) {
    const copy = new Date(d);
    const day = copy.getDay(); // 0 = Sunday
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

export default function SchedulePage() {
    const [viewMode, setViewMode] = useState<ViewMode>("weekly-report");
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Data states
    const [weeklySchedule, setWeeklySchedule] = useState<WeeklyReportDay[]>([]);
    const [weekRange, setWeekRange] = useState("");
    const [dailyStaff, setDailyStaff] = useState<DailyStaffEmployee[]>([]);
    const [selectedDayDetail, setSelectedDayDetail] = useState<WeeklyReportDay | null>(null);

    // Assign mode
    const [assignForm, setAssignForm] = useState<AssignForm>(emptyAssignForm);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [employees, setEmployees] = useState<UserProfile[]>([]);

    const dateStr = currentDate.toISOString().split("T")[0];

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            if (viewMode === "weekly-report") {
                const res = await ScheduleApi.getWeeklyReport(dateStr);
                // Adapt to actual API response
                const raw = res as unknown as {
                    status: string;
                    message: string;
                    data: { week_range: string; weekly_schedule: WeeklyReportDay[] };
                };
                setWeeklySchedule(raw.data?.weekly_schedule ?? []);
                setWeekRange(raw.data?.week_range ?? formatWeekRange(currentDate));
                setSelectedDayDetail(null);
            } else if (viewMode === "daily-staff") {
                const res = await ScheduleApi.getDailyStaff(dateStr);
                const raw = res as unknown as {
                    message: string;
                    data: DailyStaffEmployee[];
                };
                setDailyStaff(raw.data ?? []);
            } else if (viewMode === "assign") {
                const [shiftsRes, usersRes] = await Promise.all([
                    AdminCrudApi.getShifts({ page: 1, size: 100 }),
                    UserApi.getUsers({ page: 1, size: 100, hasUserRole: false }),
                ]);
                // Both APIs return ApiResponse<PageResponse<T>>, extract .data.data
                const shiftsRaw = shiftsRes as unknown as { data?: { data?: Shift[] } };
                const usersRaw = usersRes as unknown as { data?: { data?: UserProfile[] } };
                setShifts(Array.isArray(shiftsRaw?.data?.data) ? shiftsRaw.data.data : []);
                setEmployees(Array.isArray(usersRaw?.data?.data) ? usersRaw.data.data : []);
            }
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Không thể tải dữ liệu lịch làm việc"
            );
        } finally {
            setIsLoading(false);
        }
    }, [dateStr, viewMode, currentDate]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    /** Navigation */
    function navigate(direction: "prev" | "next" | "today") {
        setCurrentDate((prev) => {
            if (direction === "today") return new Date();
            const next = new Date(prev);
            next.setDate(next.getDate() + (direction === "next" ? 7 : -7));
            return next;
        });
    }

    /** When user clicks a day in the weekly grid */
    function handleSelectDate(date: string) {
        setSelectedDate(date);
        const day = weeklySchedule.find((d) => d.date === date);
        setSelectedDayDetail(day ?? null);
    }

    /** Assignment submission */
    async function submitAssignment() {
        if (!assignForm.user_id || !assignForm.shift_id || !assignForm.date) {
            toast.error("Vui lòng chọn đủ nhân viên, ca và ngày.");
            return;
        }

        setIsSaving(true);
        try {
            await ScheduleApi.createAssignment({
                user_id: Number(assignForm.user_id),
                shift_id: Number(assignForm.shift_id),
                date: assignForm.date,
            });
            toast.success("Phân ca thành công.");
            setAssignForm(emptyAssignForm);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Phân ca thất bại");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <ScheduleHeader
                viewMode={viewMode}
                currentDate={currentDate}
                weekRange={weekRange || formatWeekRange(currentDate)}
                onViewModeChange={setViewMode}
                onNavigate={navigate}
            />

            {/* Main Content */}
            {isLoading ? (
                <>
                    {viewMode === "weekly-report" && <CalendarSkeleton />}
                    {viewMode === "daily-staff" && <DailyStaffSkeleton />}
                    {viewMode === "assign" && <CalendarSkeleton />}
                </>
            ) : (
                <>
                    {/* Weekly Report - Google Calendar Style */}
                    {viewMode === "weekly-report" && (
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-4">
                            <WeeklyCalendarGrid
                                weeklySchedule={weeklySchedule}
                                selectedDate={selectedDate}
                                onSelectDate={handleSelectDate}
                            />
                            {selectedDayDetail && (
                                <DayDetailPanel
                                    day={selectedDayDetail}
                                    onClose={() => setSelectedDayDetail(null)}
                                />
                            )}
                        </div>
                    )}

                    {/* Daily Staff */}
                    {viewMode === "daily-staff" && (
                        <DailyStaffView date={dateStr} staff={dailyStaff} />
                    )}

                    {/* Assign Shift */}
                    {viewMode === "assign" && (
                        <AssignShiftForm
                            assignForm={assignForm}
                            shifts={shifts}
                            employees={employees}
                            isSaving={isSaving}
                            onFormChange={setAssignForm}
                            onSubmit={() => void submitAssignment()}
                        />
                    )}
                </>
            )}
        </div>
    );
}
