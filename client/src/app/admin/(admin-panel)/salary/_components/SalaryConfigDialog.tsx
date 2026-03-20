"use client";

import { Button } from "@/components/ui/button";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export type SalaryConfigForm = {
    id?: number;
    rule_name: string;
    employee_type: string;
    multiplier: string;
    is_holiday: boolean;
};

type Props = {
    open: boolean;
    form: SalaryConfigForm;
    isSaving: boolean;
    onChange: (form: SalaryConfigForm) => void;
    onSubmit: () => void;
    onClose: () => void;
};

const EMPLOYEE_TYPES = [
    { value: "FULL_TIME", label: "Full-time" },
    { value: "PART_TIME", label: "Part-time" },
    { value: "CONTRACT", label: "Hợp đồng" },
];

export function SalaryConfigDialog({ open, form, isSaving, onChange, onSubmit, onClose }: Props) {
    const isEdit = Boolean(form.id);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Cập nhật Salary Config" : "Tạo Salary Config"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? `Đang chỉnh sửa config #${form.id}` : "Thêm quy tắc tính lương mới cho hệ thống."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="config-rule-name">Rule name <span className="text-destructive">*</span></Label>
                        <Input
                            id="config-rule-name"
                            placeholder="VD: Lương cơ bản ngày thường"
                            value={form.rule_name}
                            onChange={(e) => onChange({ ...form, rule_name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="config-employee-type">Loại nhân viên</Label>
                        <Select value={form.employee_type} onValueChange={(v) => onChange({ ...form, employee_type: v })}>
                            <SelectTrigger id="config-employee-type">
                                <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                            <SelectContent>
                                {EMPLOYEE_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="config-multiplier">Hệ số nhân (multiplier)</Label>
                        <Input
                            id="config-multiplier"
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="1.0"
                            value={form.multiplier}
                            onChange={(e) => onChange({ ...form, multiplier: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="checkbox"
                            id="config-is-holiday"
                            className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                            checked={form.is_holiday}
                            onChange={(e) => onChange({ ...form, is_holiday: e.target.checked })}
                        />
                        <Label htmlFor="config-is-holiday" className="cursor-pointer">
                            Áp dụng cho ngày lễ / nghỉ lễ
                        </Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? "Lưu thay đổi" : "Tạo mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
