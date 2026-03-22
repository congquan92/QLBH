"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Send } from "lucide-react";
import type { Shift } from "@/types/admin-crud";

type LeaveForm = {
    leave_date: string;
    shift_id: string;
    reason: string;
};

type Props = {
    form: LeaveForm;
    shifts: Shift[];
    isSubmitting: boolean;
    onFormChange: (form: LeaveForm) => void;
    onSubmit: (e: React.FormEvent) => void;
    onReset: () => void;
};

export function LeaveRequestForm({ form, shifts, isSubmitting, onFormChange, onSubmit, onReset }: Props) {
    return (
        <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Send className="h-5 w-5 text-primary" />
                    Gửi đơn nghỉ phép
                </CardTitle>
                <CardDescription>Điền thông tin để xin nghỉ phép</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="leave_date">Ngày nghỉ</Label>
                            <Input
                                id="leave_date"
                                type="date"
                                value={form.leave_date}
                                onChange={(e) => onFormChange({ ...form, leave_date: e.target.value })}
                                required
                                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shift_id">Ca làm việc</Label>
                            <Select
                                value={form.shift_id}
                                onValueChange={(val) => onFormChange({ ...form, shift_id: val })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn ca" />
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
                            <Label htmlFor="reason">Lý do (tuỳ chọn)</Label>
                            <Input
                                id="reason"
                                value={form.reason}
                                onChange={(e) => onFormChange({ ...form, reason: e.target.value })}
                                placeholder="Nhập lý do nghỉ phép..."
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Gửi đơn
                                </>
                            )}
                        </Button>
                        <Button type="button" variant="outline" onClick={onReset}>
                            Hủy
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
