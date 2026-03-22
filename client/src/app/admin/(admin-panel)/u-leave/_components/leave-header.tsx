"use client";

import { useState } from "react";
import { CalendarOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import type { Shift } from "@/types/admin-crud";

type LeaveForm = {
    leave_date: string;
    shift_id: string;
    reason: string;
};

type Props = {
    shifts: Shift[];
    isSubmitting: boolean;
    onSubmit: (form: LeaveForm) => Promise<void>;
};

const emptyForm: LeaveForm = { leave_date: "", shift_id: "", reason: "" };

export function LeaveHeader({ shifts, isSubmitting, onSubmit }: Props) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<LeaveForm>(emptyForm);

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
                        <DialogDescription>
                            Điền thông tin bên dưới để gửi đơn xin nghỉ phép
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="leave_date">Ngày nghỉ</Label>
                            <Input
                                id="leave_date"
                                type="date"
                                value={form.leave_date}
                                onChange={(e) => setForm({ ...form, leave_date: e.target.value })}
                                required
                                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shift_id">Ca làm việc</Label>
                            <Select
                                value={form.shift_id}
                                onValueChange={(val) => setForm({ ...form, shift_id: val })}
                                required
                            >
                                <SelectTrigger id="shift_id">
                                    <SelectValue placeholder="Chọn ca làm việc" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shifts.map((shift) => (
                                        <SelectItem key={shift.id} value={String(shift.id)}>
                                            {shift.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Lý do <span className="text-muted-foreground text-xs">(tuỳ chọn)</span></Label>
                            <Input
                                id="reason"
                                value={form.reason}
                                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                placeholder="Nhập lý do nghỉ phép..."
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
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
                                onClick={() => { setForm(emptyForm); setOpen(false); }}
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
