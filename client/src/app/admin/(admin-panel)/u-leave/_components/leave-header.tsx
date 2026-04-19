"use client";

import { useState } from "react";
import { CalendarOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import type { Shift } from "@/types/admin-crud";

const TOMORROW_MIN_DATE = new Date(Date.now() + 86400000).toISOString().split("T")[0];

type LeaveForm = {
    leave_type: "ANNUAL" | "SICK_MATERNITY" | "RESIGNATION";
    start_date: string;
    end_date: string;
    shift_id: string;
    reason: string;
};

type Props = {
    shifts: Shift[];
    isSubmitting: boolean;
    isLoadingShifts: boolean;
    onLeaveDateChange: (leaveDate: string) => Promise<void>;
    onSubmit: (form: LeaveForm) => Promise<void>;
};

const emptyForm: LeaveForm = {
    leave_type: "ANNUAL",
    start_date: "",
    end_date: "",
    shift_id: "",
    reason: "",
};

export function LeaveHeader({ shifts, isSubmitting, isLoadingShifts, onLeaveDateChange, onSubmit }: Props) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<LeaveForm>(emptyForm);
    const isResignation = form.leave_type === "RESIGNATION";
    const isSingleDay = Boolean(form.start_date) && Boolean(form.end_date) && form.start_date === form.end_date;
    const shouldSelectShift = !isResignation && isSingleDay;
    const effectiveDate = isResignation ? (form.start_date || TOMORROW_MIN_DATE) : form.start_date;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await onSubmit(form);
        setForm(emptyForm);
        setOpen(false);
    }

    return (
        <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                    <CalendarOff className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Đơn nghỉ phép</h1>
                    <p className="text-sm text-muted-foreground">Gửi và theo dõi đơn nghỉ phép của bạn</p>
                </div>
            </div>

            {/* Button mở dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Gửi đơn nghỉ phép
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" />
                            Gửi đơn nghỉ phép
                        </DialogTitle>
                        <DialogDescription>Điền thông tin bên dưới để gửi đơn xin nghỉ phép</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="leave_type">Loại nghỉ</Label>
                            <Select
                                value={form.leave_type}
                                onValueChange={(value) => {
                                    const nextType = value as LeaveForm["leave_type"];
                                    if (nextType === "RESIGNATION") {
                                        const autoDate = TOMORROW_MIN_DATE;
                                        setForm((prev) => ({
                                            ...prev,
                                            leave_type: nextType,
                                            start_date: autoDate,
                                            end_date: autoDate,
                                            shift_id: "",
                                        }));
                                        void onLeaveDateChange(autoDate);
                                        return;
                                    }

                                    setForm((prev) => ({
                                        ...prev,
                                        leave_type: nextType,
                                        start_date: prev.start_date || "",
                                        end_date: prev.end_date || prev.start_date || "",
                                    }));
                                }}
                            >
                                <SelectTrigger id="leave_type">
                                    <SelectValue placeholder="Chọn loại nghỉ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ANNUAL">Nghỉ phép</SelectItem>
                                    <SelectItem value="SICK_MATERNITY">Nghỉ ốm đau / thai sản</SelectItem>
                                    <SelectItem value="RESIGNATION">Nghỉ việc</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {!isResignation ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Ngày bắt đầu</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={form.start_date}
                                        onChange={(e) => {
                                            const nextDate = e.target.value;
                                            setForm((prev) => ({
                                                ...prev,
                                                start_date: nextDate,
                                                end_date: prev.end_date || nextDate,
                                                shift_id: "",
                                            }));
                                            void onLeaveDateChange(nextDate);
                                        }}
                                        required
                                        min={TOMORROW_MIN_DATE}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">Ngày kết thúc</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={form.end_date}
                                        onChange={(e) => {
                                            const nextDate = e.target.value;
                                            setForm((prev) => ({ ...prev, end_date: nextDate }));
                                        }}
                                        required
                                        min={form.start_date || TOMORROW_MIN_DATE}
                                    />
                                </div>
                            </>
                        ) : null}

                        {shouldSelectShift ? (
                            <div className="space-y-2">
                                <Label htmlFor="shift_id">Ca làm việc</Label>
                                <Select
                                    value={form.shift_id}
                                    onValueChange={(val) => setForm({ ...form, shift_id: val })}
                                    required
                                    disabled={!effectiveDate || isLoadingShifts || shifts.length === 0}
                                >
                                    <SelectTrigger id="shift_id">
                                        <SelectValue placeholder={isLoadingShifts ? "Đang tải ca làm việc..." : "Chọn ca làm việc"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shifts.map((shift) => (
                                            <SelectItem key={shift.id} value={String(shift.id)}>
                                                {shift.name} {shift.start_time && shift.end_time ? `(${shift.start_time} - ${shift.end_time})` : ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {effectiveDate && !isLoadingShifts && shifts.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">Bạn không có lịch làm việc trong ngày đã chọn.</p>
                                ) : null}
                            </div>
                        ) : null}

                        {!isResignation && !shouldSelectShift && form.start_date && form.end_date ? (
                            <p className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                                Đơn nghỉ theo khoảng thời gian sẽ tự áp dụng theo lịch làm việc thực tế của từng ngày, không cần chọn ca cố định.
                            </p>
                        ) : null}

                        <div className="space-y-2">
                            <Label htmlFor="reason">
                                Lý do <span className="text-muted-foreground text-xs">(tuỳ chọn)</span>
                            </Label>
                            <Input id="reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Nhập lý do nghỉ phép..." />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={isSubmitting || (shouldSelectShift && !form.shift_id)} className="flex-1">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Gửi đơn
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setForm(emptyForm);
                                    setOpen(false);
                                }}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
