"use client";

import { ScheduleApi } from "@/api/admin/schedule.api";
import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { AttendanceApi } from "@/api/admin/attendance.api";
import { ExportApi } from "@/api/admin/export.api";
import { UserApi } from "@/api/user.api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Position, Shift } from "@/types/admin-crud";
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
import { ShiftManagement } from "./_components/shift-management";
import { LateArrivalsView } from "./_components/late-arrivals-view";
import { PositionDefaultScheduleForm } from "./_components/position-default-schedule-form";
import { CalendarSkeleton, DailyStaffSkeleton } from "./_components/schedule-skeletons";

type ViewMode = "weekly-report" | "daily-staff" | "assign" | "shift-management" | "position-default" | "late-arrivals";

type LateArrivalItem = {
    date: string;
    user_id: number;
    full_name: string;
    position: string;
    shift_name: string;
    shift_time: string;
    check_in: string;
    late_minutes: string;
};

type LateRange = "THIS_WEEK" | "LAST_WEEK" | "THIS_MONTH" | "LAST_MONTH";

type AssignForm = {
    user_id: string;
    shift_id: string;
    date: string;
};

type AssignDayShift = {
    shift_id: number | null;
    shift_name: string;
    time: string;
    type: string;
};

const emptyAssignForm: AssignForm = {
    user_id: "",
    shift_id: "",
    date: new Date().toISOString().split("T")[0],
};

function createEmptyDayShiftMap(): Record<number, string> {
    return {
        0: "",
        1: "",
        2: "",
        3: "",
        4: "",
        5: "",
        6: "",
    };
}

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
    const [isRecordingAttendance, setIsRecordingAttendance] = useState(false);

    // Data states
    const [weeklySchedule, setWeeklySchedule] = useState<WeeklyReportDay[]>([]);
    const [weekRange, setWeekRange] = useState("");
    const [dailyStaff, setDailyStaff] = useState<DailyStaffEmployee[]>([]);
    const [selectedDayDetail, setSelectedDayDetail] = useState<WeeklyReportDay | null>(null);

    // Assign mode
    const [assignForm, setAssignForm] = useState<AssignForm>(emptyAssignForm);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [shiftKeyword, setShiftKeyword] = useState("");
    const [employees, setEmployees] = useState<UserProfile[]>([]);
    const [assignDayShifts, setAssignDayShifts] = useState<AssignDayShift[]>([]);
    const [isLoadingAssignDayShifts, setIsLoadingAssignDayShifts] = useState(false);
    const [positions, setPositions] = useState<Position[]>([]);
    const [positionDefaultForm, setPositionDefaultForm] = useState<{
        position_id: string;
        dayShiftMap: Record<number, string>;
    }>({
        position_id: "",
        dayShiftMap: createEmptyDayShiftMap(),
    });
    const [isLoadingPositionSchedule, setIsLoadingPositionSchedule] = useState(false);
    const [lateRange, setLateRange] = useState<LateRange>("THIS_WEEK");
    const [lateRangeLabel, setLateRangeLabel] = useState("");
    const [lateArrivals, setLateArrivals] = useState<LateArrivalItem[]>([]);
    const [isExportingLateArrivals, setIsExportingLateArrivals] = useState(false);

    const dateStr = currentDate.toISOString().split("T")[0];

    const fetchShifts = useCallback(async (keyword?: string) => {
        const shiftsRes = await AdminCrudApi.getShifts({ page: 1, size: 100, sort: "id:asc", keyword: keyword?.trim() || undefined, status: "all" });
        const shiftsRaw = shiftsRes as unknown as { data?: { data?: Shift[] } };
        setShifts(Array.isArray(shiftsRaw?.data?.data) ? shiftsRaw.data.data : []);
    }, []);

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
            } else if (viewMode === "position-default") {
                const [shiftsRes, positionsRes] = await Promise.all([
                    AdminCrudApi.getShifts({ page: 1, size: 100, sort: "id:asc" }),
                    AdminCrudApi.getPositions({ page: 1, size: 100, sort: "id:asc" }),
                ]);
                const shiftsRaw = shiftsRes as unknown as { data?: { data?: Shift[] } };
                const positionsRaw = positionsRes as unknown as { data?: { data?: Position[] } };
                setShifts(Array.isArray(shiftsRaw?.data?.data) ? shiftsRaw.data.data : []);
                setPositions(Array.isArray(positionsRaw?.data?.data) ? positionsRaw.data.data : []);
            } else if (viewMode === "late-arrivals") {
                const res = await ExportApi.getLateArrivalsPreview({ time_range: lateRange });
                const raw = res as unknown as {
                    data?: {
                        time_range_label?: string;
                        data?: LateArrivalItem[];
                    };
                };
                setLateRangeLabel(String(raw?.data?.time_range_label ?? ""));
                setLateArrivals(Array.isArray(raw?.data?.data) ? raw.data.data : []);
            }
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Không thể tải dữ liệu lịch làm việc"
            );
        } finally {
            setIsLoading(false);
        }
    }, [dateStr, viewMode, currentDate, lateRange]);

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

        const selectedShift = shifts.find((shift) => String(shift.id) === assignForm.shift_id);
        if (!selectedShift) {
            toast.error("Không tìm thấy thông tin ca đã chọn.");
            return;
        }

        const toMinutes = (time: string) => {
            const [h, m] = String(time).split(":");
            return Number(h || 0) * 60 + Number(m || 0);
        };

        const parseRange = (range: string) => {
            const [startRaw, endRaw] = String(range).split("-").map((part) => part.trim());
            if (!startRaw || !endRaw) return null;
            return {
                start: toMinutes(startRaw),
                end: toMinutes(endRaw),
            };
        };

        const nextRange = {
            start: toMinutes(String(selectedShift.start_time ?? "00:00")),
            end: toMinutes(String(selectedShift.end_time ?? "00:00")),
        };

        const conflict = assignDayShifts.find((existing) => {
            const existingRange = parseRange(existing.time);
            if (!existingRange || existing.shift_id === null) return false;
            return nextRange.start < existingRange.end && nextRange.end > existingRange.start;
        });

        if (conflict) {
            const typeLabel = String(conflict.type || "Ca hiện có");
            const canRevoke = typeLabel.toLowerCase().includes("đặc biệt");
            toast.error(
                canRevoke
                    ? `Không thể phân ca: trùng với ${typeLabel.toLowerCase()} '${conflict.shift_name}' (${conflict.time}). Hãy thu hồi ca đặc biệt trước khi phân ca mới.`
                    : `Không thể phân ca: trùng với ${typeLabel.toLowerCase()} '${conflict.shift_name}' (${conflict.time}).`
            );
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
            const currentDate = assignForm.date;
            const currentUserId = assignForm.user_id;
            setAssignForm((current) => ({ ...current, shift_id: "" }));
            if (currentUserId && currentDate) {
                void loadAssignDayShifts(currentUserId, currentDate);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Phân ca thất bại");
        } finally {
            setIsSaving(false);
        }
    }

    const loadAssignDayShifts = useCallback(async (userId: string, date: string) => {
        if (!userId || !date) {
            setAssignDayShifts([]);
            return;
        }

        setIsLoadingAssignDayShifts(true);
        try {
            const res = await ScheduleApi.getWeeklyEmployee(Number(userId), date);
            const raw = res as unknown as {
                week_schedule?: AssignDayShift[];
                data?: {
                    week_schedule?: AssignDayShift[];
                };
            };

            const weekSchedule = Array.isArray(raw?.week_schedule)
                ? raw.week_schedule
                : Array.isArray(raw?.data?.week_schedule)
                    ? raw.data.week_schedule
                    : [];

            const selectedDay = weekSchedule.find((item: unknown) => {
                const day = item as { date?: string };
                return day?.date === date;
            }) as { shifts?: AssignDayShift[] } | undefined;

            setAssignDayShifts(Array.isArray(selectedDay?.shifts) ? selectedDay.shifts : []);
        } catch {
            setAssignDayShifts([]);
        } finally {
            setIsLoadingAssignDayShifts(false);
        }
    }, []);

    const revokeSpecialShift = useCallback(async (shiftId: number) => {
        if (!assignForm.user_id || !assignForm.date) return;

        setIsSaving(true);
        try {
            await ScheduleApi.deleteAssignment({
                user_id: Number(assignForm.user_id),
                date: assignForm.date,
                shift_id: shiftId,
            });
            toast.success("Đã thu hồi ca đặc biệt. Bạn có thể phân ca mới.");
            await loadAssignDayShifts(assignForm.user_id, assignForm.date);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể thu hồi ca đặc biệt.");
        } finally {
            setIsSaving(false);
        }
    }, [assignForm.date, assignForm.user_id, loadAssignDayShifts]);

    const searchShifts = useCallback(async (keyword: string) => {
        setShiftKeyword(keyword);
        setIsLoading(true);
        try {
            await fetchShifts(keyword);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tìm kiếm ca làm");
        } finally {
            setIsLoading(false);
        }
    }, [fetchShifts]);

    const createShift = useCallback(async (payload: { name: string; start_time: string; end_time: string; grace_period?: number }) => {
        setIsSaving(true);
        try {
            await AdminCrudApi.createShift(payload);
            toast.success("Tạo ca làm thành công.");
            await searchShifts(shiftKeyword);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tạo ca làm");
        } finally {
            setIsSaving(false);
        }
    }, [searchShifts, shiftKeyword]);

    useEffect(() => {
        if (viewMode !== "assign") return;
        if (!assignForm.user_id || !assignForm.date) {
            setAssignDayShifts([]);
            return;
        }

        void loadAssignDayShifts(assignForm.user_id, assignForm.date);
    }, [assignForm.date, assignForm.user_id, loadAssignDayShifts, viewMode]);

    const updateShift = useCallback(async (id: number, payload: { name?: string; start_time?: string; end_time?: string; grace_period?: number }) => {
        setIsSaving(true);
        try {
            await AdminCrudApi.updateShift(id, payload);
            toast.success("Cập nhật ca làm thành công.");
            await searchShifts(shiftKeyword);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể cập nhật ca làm");
        } finally {
            setIsSaving(false);
        }
    }, [searchShifts, shiftKeyword]);

    const deleteShift = useCallback(async (id: number) => {
        setIsSaving(true);
        try {
            await AdminCrudApi.deleteShift(id);
            toast.success("Đã ẩn ca làm thành công.");
            await searchShifts(shiftKeyword);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể xóa ca làm");
        } finally {
            setIsSaving(false);
        }
    }, [searchShifts, shiftKeyword]);

    const restoreShift = useCallback(async (id: number) => {
        setIsSaving(true);
        try {
            await AdminCrudApi.restoreShift(id);
            toast.success("Khôi phục ca làm thành công.");
            await searchShifts(shiftKeyword);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể khôi phục ca làm");
        } finally {
            setIsSaving(false);
        }
    }, [searchShifts, shiftKeyword]);

    async function loadPositionDefaultSchedule(positionId: string) {
        if (!positionId) return;

        setIsLoadingPositionSchedule(true);
        try {
            const res = await ScheduleApi.getPositionSchedule(Number(positionId));
            const raw = res as unknown as {
                data?: {
                    default_schedules?: Array<{ day_of_week?: number; shift_id?: number }>;
                };
            };

            const nextMap = createEmptyDayShiftMap();
            const schedules = raw?.data?.default_schedules ?? [];
            schedules.forEach((item) => {
                const day = Number(item.day_of_week);
                if (day >= 0 && day <= 6 && item.shift_id) {
                    nextMap[day] = String(item.shift_id);
                }
            });

            setPositionDefaultForm((current) => ({
                ...current,
                dayShiftMap: nextMap,
            }));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tải lịch mặc định của chức vụ");
        } finally {
            setIsLoadingPositionSchedule(false);
        }
    }

    async function submitPositionDefaultSchedule() {
        if (!positionDefaultForm.position_id) {
            toast.error("Vui lòng chọn chức vụ cần cấu hình.");
            return;
        }

        const schedules = Object.entries(positionDefaultForm.dayShiftMap)
            .filter(([, shiftId]) => Boolean(shiftId))
            .map(([day, shiftId]) => ({
                day_of_week: Number(day),
                shift_id: Number(shiftId),
            }));

        if (schedules.length === 0) {
            toast.error("Vui lòng chọn ít nhất một ngày làm việc.");
            return;
        }

        setIsSaving(true);
        try {
            await ScheduleApi.setPositionDefaultSchedule(Number(positionDefaultForm.position_id), {
                schedules,
            });
            toast.success("Cập nhật lịch mặc định theo chức vụ thành công.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể cập nhật lịch mặc định.");
        } finally {
            setIsSaving(false);
        }
    }

    async function exportLateArrivals() {
        setIsExportingLateArrivals(true);
        try {
            const blob = await ExportApi.exportLateArrivals({ time_range: lateRange });
            ExportApi.downloadBlob(blob, `danh-sach-di-tre-${lateRange.toLowerCase()}.xlsx`);
            toast.success("Xuất file đi trễ thành công.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể xuất file đi trễ.");
        } finally {
            setIsExportingLateArrivals(false);
        }
    }

    async function handleAttendanceRecord() {
        setIsRecordingAttendance(true);
        try {
            const res = await AttendanceApi.record();
            const raw = res as { message?: string };
            toast.success(raw?.message ?? "Điểm danh thành công.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể điểm danh.");
        } finally {
            setIsRecordingAttendance(false);
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
                isRecordingAttendance={isRecordingAttendance}
                onAttendanceRecord={() => void handleAttendanceRecord()}
            />

            {/* Main Content */}
            {isLoading && viewMode !== "shift-management" ? (
                <>
                    {viewMode === "weekly-report" && <CalendarSkeleton />}
                    {viewMode === "daily-staff" && <DailyStaffSkeleton />}
                    {viewMode === "assign" && <CalendarSkeleton />}
                    {viewMode === "position-default" && <CalendarSkeleton />}
                    {viewMode === "late-arrivals" && <DailyStaffSkeleton />}
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
                            dayShifts={assignDayShifts}
                            isLoadingDayShifts={isLoadingAssignDayShifts}
                            isSaving={isSaving}
                            onFormChange={setAssignForm}
                            onRevokeSpecialShift={(shiftId) => void revokeSpecialShift(shiftId)}
                            onSubmit={() => void submitAssignment()}
                        />
                    )}

                    {viewMode === "shift-management" && (
                        <ShiftManagement
                            shifts={shifts}
                            isLoading={isLoading}
                            isSaving={isSaving}
                            onRefresh={() => searchShifts(shiftKeyword)}
                            onSearch={searchShifts}
                            onCreate={createShift}
                            onUpdate={updateShift}
                            onDelete={deleteShift}
                            onRestore={restoreShift}
                        />
                    )}

                    {viewMode === "position-default" && (
                        <PositionDefaultScheduleForm
                            positions={positions}
                            shifts={shifts}
                            selectedPositionId={positionDefaultForm.position_id}
                            dayShiftMap={positionDefaultForm.dayShiftMap}
                            isLoadingPositionSchedule={isLoadingPositionSchedule}
                            isSaving={isSaving}
                            onPositionChange={(positionId) => {
                                setPositionDefaultForm({
                                    position_id: positionId,
                                    dayShiftMap: createEmptyDayShiftMap(),
                                });
                                if (positionId) {
                                    void loadPositionDefaultSchedule(positionId);
                                }
                            }}
                            onDayShiftChange={(dayOfWeek, shiftId) => {
                                setPositionDefaultForm((current) => ({
                                    ...current,
                                    dayShiftMap: {
                                        ...current.dayShiftMap,
                                        [dayOfWeek]: shiftId,
                                    },
                                }));
                            }}
                            onLoadCurrentSchedule={() => void loadPositionDefaultSchedule(positionDefaultForm.position_id)}
                            onSubmit={() => void submitPositionDefaultSchedule()}
                        />
                    )}

                    {viewMode === "late-arrivals" && (
                        <LateArrivalsView
                            timeRange={lateRange}
                            label={lateRangeLabel}
                            records={lateArrivals}
                            isLoading={isLoading}
                            isExporting={isExportingLateArrivals}
                            onTimeRangeChange={setLateRange}
                            onExport={() => void exportLateArrivals()}
                        />
                    )}
                </>
            )}
        </div>
    );
}
