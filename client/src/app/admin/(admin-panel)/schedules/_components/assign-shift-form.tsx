"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Shift } from "@/types/admin-crud";
import type { UserProfile } from "@/types/user";
import { Plus, Loader2, CalendarPlus, User, Clock, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type AssignForm = {
    user_id: string;
    shift_id: string;
    date: string;
};

type Props = {
    assignForm: AssignForm;
    shifts: Shift[];
    employees: UserProfile[];
    dayShifts: Array<{
        shift_id: number | null;
        shift_name: string;
        time: string;
        type: string;
    }>;
    isLoadingDayShifts: boolean;
    isSaving: boolean;
    onFormChange: (form: AssignForm) => void;
    onRevokeSpecialShift: (shiftId: number) => void;
    onSubmit: () => void;
};

export function AssignShiftForm({ assignForm, shifts, employees, dayShifts, isLoadingDayShifts, isSaving, onFormChange, onRevokeSpecialShift, onSubmit }: Props) {
    const [employeeQuery, setEmployeeQuery] = useState("");

    const filteredEmployees = useMemo(() => {
        const query = employeeQuery.trim().toLowerCase();
        if (!query) return employees;

        return employees.filter((emp) => {
            const fullName = String(emp.fullName ?? "").toLowerCase();
            const username = String(emp.userName ?? emp.username ?? "").toLowerCase();
            const email = String(emp.email ?? "").toLowerCase();
            const phone = String(emp.phone ?? "").toLowerCase();
            const position = String(emp.positionResponse?.name ?? "").toLowerCase();
            const id = String(emp.id);

            return [fullName, username, email, phone, position, id].some((value) => value.includes(query));
        });
    }, [employees, employeeQuery]);

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-linear-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    <CalendarPlus className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-semibold">Phân ca làm việc</h3>
                    <p className="text-xs text-muted-foreground">Chọn nhân viên, ca và ngày để phân ca</p>
                </div>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Employee */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-1.5 text-sm font-medium">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            Nhân viên
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="h-9 pl-8"
                                placeholder="Tìm theo tên, mã nhân viên, username, email, SĐT..."
                                value={employeeQuery}
                                onChange={(e) => setEmployeeQuery(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <select
                                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                                value={assignForm.user_id}
                                onChange={(e) =>
                                    onFormChange({ ...assignForm, user_id: e.target.value })
                                }
                            >
                                <option value="">Chọn nhân viên</option>
                                {filteredEmployees.map((emp) => (
                                    <option key={emp.id} value={String(emp.id)}>
                                        #{emp.id} - {String(emp.fullName ?? emp.username ?? `User #${emp.id}`)} - {String(emp.positionResponse?.name ?? "N/A")} - {String(emp.employmentType ?? emp.employment_type ?? "N/A")}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Hiển thị {filteredEmployees.length}/{employees.length} nhân viên phù hợp.</p>
                    </div>

                    {/* Shift */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-1.5 text-sm font-medium">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            Ca làm việc
                        </Label>
                        <div className="relative">
                            <select
                                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                                value={assignForm.shift_id}
                                onChange={(e) =>
                                    onFormChange({ ...assignForm, shift_id: e.target.value })
                                }
                            >
                                <option value="">Chọn ca</option>
                                {shifts.map((shift) => (
                                    <option key={shift.id} value={String(shift.id)}>
                                        {String(shift.name ?? `Shift #${shift.id}`)} ({String(shift.start_time ?? "")} – {String(shift.end_time ?? "")})
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

                    {/* Date */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-1.5 text-sm font-medium">
                            <CalendarPlus className="w-3.5 h-3.5 text-muted-foreground" />
                            Ngày
                        </Label>
                        <Input
                            type="date"
                            className="h-10 rounded-lg"
                            value={assignForm.date}
                            onChange={(e) =>
                                onFormChange({ ...assignForm, date: e.target.value })
                            }
                        />
                    </div>
                </div>

                <Button
                    onClick={onSubmit}
                    disabled={isSaving}
                    className="gap-2 px-6 h-10 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Plus className="h-4 w-4" />
                    )}
                    Phân ca
                </Button>

                <div className="rounded-lg border p-3 space-y-2">
                    <p className="text-sm font-medium">Ca đã có trong ngày được chọn</p>
                    {isLoadingDayShifts ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Đang tải lịch hiện tại...
                        </p>
                    ) : dayShifts.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Ngày này chưa có ca mặc định hoặc ca đặc biệt.</p>
                    ) : (
                        <div className="space-y-2">
                            {dayShifts.map((shift, index) => {
                                const isSpecial = String(shift.type || "").toLowerCase().includes("đặc biệt");
                                return (
                                    <div key={`${shift.shift_id ?? "none"}-${index}`} className="flex items-center justify-between gap-2 rounded-md border p-2">
                                        <div className="text-xs">
                                            <p className="font-medium">{shift.shift_name} ({shift.time})</p>
                                            <p className="text-muted-foreground">Loại: {shift.type}</p>
                                        </div>
                                        {isSpecial && shift.shift_id ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={isSaving}
                                                onClick={() => onRevokeSpecialShift(shift.shift_id as number)}
                                            >
                                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                                Thu hồi
                                            </Button>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
