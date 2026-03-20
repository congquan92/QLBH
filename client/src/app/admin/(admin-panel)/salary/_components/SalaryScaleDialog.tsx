"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export type SalaryScaleForm = {
    id?: number;
    name: string;
    years_of_experience: string;
    coefficient: string;
};

type Props = {
    open: boolean;
    form: SalaryScaleForm;
    isSaving: boolean;
    onChange: (form: SalaryScaleForm) => void;
    onSubmit: () => void;
    onClose: () => void;
};

export function SalaryScaleDialog({ open, form, isSaving, onChange, onSubmit, onClose }: Props) {
    const isEdit = Boolean(form.id);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Cập nhật Thang Lương" : "Tạo Thang Lương"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? `Đang chỉnh sửa thang lương #${form.id}` : "Thêm mốc hệ số lương theo kinh nghiệm."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="scale-name">Tên thang lương <span className="text-destructive">*</span></Label>
                        <Input
                            id="scale-name"
                            placeholder="VD: Mới tốt nghiệp, Senior..."
                            value={form.name}
                            onChange={(e) => onChange({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="scale-years">Số năm kinh nghiệm</Label>
                            <Input
                                id="scale-years"
                                type="number"
                                min="0"
                                step="1"
                                placeholder="0"
                                value={form.years_of_experience}
                                onChange={(e) => onChange({ ...form, years_of_experience: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="scale-coefficient">Hệ số lương</Label>
                            <Input
                                id="scale-coefficient"
                                type="number"
                                min="1"
                                step="0.1"
                                placeholder="1.0"
                                value={form.coefficient}
                                onChange={(e) => onChange({ ...form, coefficient: e.target.value })}
                            />
                        </div>
                    </div>

                    {form.years_of_experience && form.coefficient && (
                        <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm">
                            <p className="text-muted-foreground">Tóm tắt:</p>
                            <p className="font-medium mt-0.5">
                                Nhân viên &ge; <span className="text-primary">{form.years_of_experience} năm</span> kinh nghiệm
                                → nhân hệ số <span className="text-primary">x{form.coefficient}</span>
                            </p>
                        </div>
                    )}
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
