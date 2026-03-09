"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
import { ScheduleApi } from "@/api/schedule.api";
import { AdminCrudApi } from "@/api/admin-crud.api";
import { UserApi } from "@/api/user.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Users, Clock, Loader2, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Shift } from "@/types/admin-crud";
import type { DailyStaff, MySchedule, WeeklyReport } from "@/types/schedule";
import type { UserProfile } from "@/types/user";

type ViewMode = "weekly-report" | "daily-staff" | "my-schedule" | "assign";

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

export default function SchedulePage() {
    const { hasPermission } = useAdminAuth();
    const [viewMode, setViewMode] = useState<ViewMode>("my-schedule");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [weeklyData, setWeeklyData] = useState<WeeklyReport | null>(null);
    const [dailyData, setDailyData] = useState<DailyStaff | null>(null);
    const [mySchedule, setMySchedule] = useState<MySchedule | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [assignForm, setAssignForm] = useState<AssignForm>(emptyAssignForm);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [employees, setEmployees] = useState<UserProfile[]>([]);

    const canViewReport = hasPermission("VIEW_SCHEDULE_REPORT");
    const canViewDaily = hasPermission("VIEW_DAILY_SCHEDULE");
    const canManageSchedule = hasPermission("ASSIGN_SHIFT") || hasPermission("DELETE_SHIFT_ASSIGNMENT") || hasPermission("SET_DEFAULT_SCHEDULE");

    async function fetchData() {
        setIsLoading(true);
        try {
            if (viewMode === "weekly-report" && canViewReport) {
                const res = await ScheduleApi.getWeeklyReport(selectedDate);
                setWeeklyData(res.data);
            } else if (viewMode === "daily-staff" && canViewDaily) {
                const res = await ScheduleApi.getDailyStaff(selectedDate);
                setDailyData(res.data);
            } else if (viewMode === "my-schedule") {
                const res = await ScheduleApi.getMySchedule(selectedDate);
                setMySchedule(res.data);
            } else if (viewMode === "assign" && canManageSchedule) {
                const [shiftsRes, usersRes] = await Promise.all([AdminCrudApi.getShifts({ page: 1, size: 100 }), UserApi.getUsers({ page: 1, size: 100 })]);
                setShifts(shiftsRes.data.data);
                setEmployees(usersRes.data.data);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tải dữ liệu lịch làm việc");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void fetchData();
    }, [viewMode, selectedDate]);

    function changeDate(days: number) {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split("T")[0]);
    }

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

    async function handleDeleteAssignment(assignmentId: number) {
        if (!confirm("Bạn có chắc chắn muốn xóa phân ca này?")) return;

        setIsSaving(true);
        try {
            await ScheduleApi.deleteAssignment({ id: assignmentId });
            toast.success("Đã xóa phân ca.");
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Xóa phân ca thất bại");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lịch làm việc</h1>
                    <p className="text-muted-foreground">Xem lịch và phân ca làm việc</p>
                </div>
            </div>

            {/* View Mode Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Chế độ xem</CardTitle>
                    <CardDescription>Chọn loại thông tin lịch làm việc bạn muốn xem</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 flex-wrap">
                        <Button variant={viewMode === "my-schedule" ? "default" : "outline"} onClick={() => setViewMode("my-schedule")}>
                            <Clock className="mr-2 h-4 w-4" />
                            Lịch của tôi
                        </Button>
                        {canViewDaily && (
                            <Button variant={viewMode === "daily-staff" ? "default" : "outline"} onClick={() => setViewMode("daily-staff")}>
                                <Users className="mr-2 h-4 w-4" />
                                Lịch theo ngày
                            </Button>
                        )}
                        {canViewReport && (
                            <Button variant={viewMode === "weekly-report" ? "default" : "outline"} onClick={() => setViewMode("weekly-report")}>
                                <Calendar className="mr-2 h-4 w-4" />
                                Báo cáo tuần
                            </Button>
                        )}
                        {canManageSchedule && (
                            <Button variant={viewMode === "assign" ? "default" : "outline"} onClick={() => setViewMode("assign")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Phân ca
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Date Selector */}
            {viewMode !== "assign" && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="max-w-xs" />
                            <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}>
                                Hôm nay
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Content */}
            {isLoading ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        <span className="text-muted-foreground">Đang tải...</span>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Assignment Form */}
                    {viewMode === "assign" && canManageSchedule && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Phân ca làm việc</CardTitle>
                                <CardDescription>Chọn nhân viên, ca và ngày để phân ca</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <Label>Nhân viên</Label>
                                        <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={assignForm.user_id} onChange={(e) => setAssignForm((prev) => ({ ...prev, user_id: e.target.value }))}>
                                            <option value="">Chọn nhân viên</option>
                                            {employees.map((emp) => (
                                                <option key={emp.id} value={String(emp.id)}>
                                                    {String(emp.fullName ?? emp.username ?? `User #${emp.id}`)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ca làm việc</Label>
                                        <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={assignForm.shift_id} onChange={(e) => setAssignForm((prev) => ({ ...prev, shift_id: e.target.value }))}>
                                            <option value="">Chọn ca</option>
                                            {shifts.map((shift) => (
                                                <option key={shift.id} value={String(shift.id)}>
                                                    {String(shift.name ?? `Shift #${shift.id}`)} ({String(shift.start_time ?? "")} - {String(shift.end_time ?? "")})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ngày</Label>
                                        <Input type="date" value={assignForm.date} onChange={(e) => setAssignForm((prev) => ({ ...prev, date: e.target.value }))} />
                                    </div>
                                </div>
                                <Button onClick={() => void submitAssignment()} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Phân ca
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* My Schedule */}
                    {viewMode === "my-schedule" && mySchedule && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Lịch làm việc của {mySchedule.employee}</CardTitle>
                                <CardDescription>
                                    {mySchedule.position} - Tuần từ {mySchedule.week_start}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {mySchedule.schedule?.map((day, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                                            <div>
                                                <div className="font-semibold">{day.day_name}</div>
                                                <div className="text-sm text-muted-foreground">{new Date(day.date).toLocaleDateString("vi-VN")}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">{day.shift_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {day.start_time} - {day.end_time}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!mySchedule.schedule || mySchedule.schedule.length === 0) && <div className="text-center py-8 text-muted-foreground">Không có lịch làm việc trong tuần này</div>}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Daily Staff */}
                    {viewMode === "daily-staff" && dailyData && canViewDaily && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Lịch làm việc ngày {new Date(selectedDate).toLocaleDateString("vi-VN")}</CardTitle>
                                <CardDescription>Danh sách nhân viên theo ca làm việc</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {dailyData.shifts?.map((shift, idx) => (
                                        <div key={idx} className="border rounded-lg p-4">
                                            <div className="font-semibold text-lg mb-2">
                                                {shift.shift_name} ({shift.employees?.length || 0} người)
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                {shift.employees?.map((emp, empIdx) => (
                                                    <div key={empIdx} className="flex items-center justify-between p-2 bg-muted rounded">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4" />
                                                            <div>
                                                                <div className="text-sm font-medium">{emp.full_name}</div>
                                                                <div className="text-xs text-muted-foreground">{emp.position}</div>
                                                            </div>
                                                        </div>
                                                        {canManageSchedule && (emp as { assignment_id?: number }).assignment_id && (
                                                            <Button variant="ghost" size="sm" onClick={() => void handleDeleteAssignment((emp as { assignment_id: number }).assignment_id)} disabled={isSaving}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {(!dailyData.shifts || dailyData.shifts.length === 0) && <div className="text-center py-8 text-muted-foreground">Không có dữ liệu lịch làm việc</div>}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Weekly Report */}
                    {viewMode === "weekly-report" && weeklyData && canViewReport && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Báo cáo tuần: {weeklyData.week_start} - {weeklyData.week_end}
                                </CardTitle>
                                <CardDescription>Thống kê quân số và phân ca trong tuần</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {weeklyData.days?.map((day, idx) => (
                                        <div key={idx} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <div className="font-semibold">{day.day_name}</div>
                                                    <div className="text-sm text-muted-foreground">{new Date(day.date).toLocaleDateString("vi-VN")}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold">{day.total_employees}</div>
                                                    <div className="text-xs text-muted-foreground">Nhân viên</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                                {day.shifts?.map((shift, shiftIdx) => (
                                                    <div key={shiftIdx} className="p-2 bg-muted rounded">
                                                        <div className="font-medium text-sm">
                                                            {shift.shift_name} ({shift.count})
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">{shift.employees?.join(", ") || "Không có nhân viên"}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
