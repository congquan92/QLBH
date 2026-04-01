"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export type PositionForm = {
    id?: number;
    name: string;
    base_salary: string;
    salary_type: "HOURLY" | "MONTHLY";
};

type Props = {
    open: boolean;
    form: PositionForm;
    isSaving: boolean;
    onChange: (form: PositionForm) => void;
    onSubmit: () => void;
    onClose: () => void;
};

export function PositionDialog({ open, form, isSaving, onChange, onSubmit, onClose }: Props) {
    const isEdit = Boolean(form.id);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Cập nhật Chức vụ" : "Tạo Chức vụ"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? `Đang chỉnh sửa chức vụ #${form.id}` : "Thêm chức vụ mới và cấu hình lương cơ bản."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="position-name">Tên chức vụ <span className="text-destructive">*</span></Label>
                        <Input
                            id="position-name"
                            placeholder="VD: Nhân viên bán hàng"
                            value={form.name}
                            onChange={(e) => onChange({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="position-base-salary">Lương cơ bản <span className="text-destructive">*</span></Label>
                            <Input
                                id="position-base-salary"
                                type="number"
                                min="1"
                                step="1000"
                                placeholder="5000000"
                                value={form.base_salary}
                                onChange={(e) => onChange({ ...form, base_salary: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="position-salary-type">Loại lương</Label>
                            <Select
                                value={form.salary_type}
                                onValueChange={(v) => onChange({ ...form, salary_type: v as "HOURLY" | "MONTHLY" })}
                            >
                                <SelectTrigger id="position-salary-type">
                                    <SelectValue placeholder="Chọn loại" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HOURLY">Theo giờ</SelectItem>
                                    <SelectItem value="MONTHLY">Theo tháng</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
