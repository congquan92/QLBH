"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { Holiday } from "@/types/admin-crud";
import { CalendarDays, Loader2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type HolidayForm = {
    id?: number;
    name: string;
    holiday_date: string;
};

const emptyForm: HolidayForm = {
    name: "",
    holiday_date: "",
};

export function HolidayManagerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<HolidayForm>(emptyForm);

    async function fetchHolidays() {
        setIsLoading(true);
        try {
            const res = await AdminCrudApi.getHolidays({ page: 1, size: 100, sort: "holiday_date:desc" });
            setHolidays(res.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (open) {
            void fetchHolidays();
            setForm(emptyForm);
        }
    }, [open]);

    function openEdit(item: Holiday) {
        setForm({
            id: item.id,
            name: String(item.name ?? ""),
            holiday_date: String(item.holiday_date ?? "").slice(0, 10),
        });
    }

    async function handleSubmit() {
        if (!form.name.trim() || !form.holiday_date) {
            toast.error("Vui lòng nhập tên và ngày.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                holiday_date: form.holiday_date,
            };

            if (form.id) {
                await AdminCrudApi.updateHoliday(form.id, payload);
                toast.success("Cập nhật ngày lễ thành công.");
            } else {
                await AdminCrudApi.createHoliday(payload);
                toast.success("Tạo ngày lễ thành công.");
            }
            setForm(emptyForm);
            await fetchHolidays();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Xóa ngày lễ này có thể ảnh hưởng việc tính thuởng. Tiếp tục?")) return;
        setIsSaving(true);
        try {
            await AdminCrudApi.deleteHoliday(id);
            toast.success("Đã xóa ngày lễ.");
            if (form.id === id) setForm(emptyForm);
            await fetchHolidays();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Xóa thất bại.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden">
                <div className="flex flex-row h-[80vh] max-h-[800px]">
                    {/* Left: Form */}
                    <div className="w-full md:w-[250px] bg-muted/30 border-r p-6 flex flex-col h-full overflow-y-auto">
                        <DialogHeader className="mb-6 text-left">
                            <DialogTitle className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5" />
                                Quản lý Ngày Lễ
                            </DialogTitle>
                            <DialogDescription>
                                Thêm mới hoặc cập nhật ngày nghỉ lễ.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 flex-1">
                            <div className="space-y-2">
                                <Label>Tên ngày lễ</Label>
                                <Input
                                    placeholder="Khánh thành, Quốc khánh..."
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Ngày</Label>
                                <Input
                                    type="date"
                                    value={form.holiday_date}
                                    onChange={(e) => setForm({ ...form, holiday_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-6 shrink-0 mt-auto">
                            <Button onClick={() => void handleSubmit()} disabled={isSaving} className="flex-1">
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {form.id ? "Lưu" : "Thêm"}
                            </Button>
                            {form.id && (
                                <Button variant="outline" onClick={() => setForm(emptyForm)}>
                                    Hủy
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right: List */}
                    <div className="flex-1 flex flex-col bg-background h-full">
                        <div className="p-4 border-b font-medium bg-muted/10">Danh sách đã tạo ({holidays.length})</div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                        <Skeleton className="h-8 w-16" />
                                    </div>
                                ))
                            ) : holidays.length === 0 ? (
                                <div className="text-center text-muted-foreground py-10">Chưa có ngày lễ nào</div>
                            ) : (
                                holidays.map((item) => (
                                    <div key={item.id} className={`flex items-start justify-between p-3 border rounded-lg transition-colors ${form.id === item.id ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'}`}>
                                        <div>
                                            <div className="font-medium text-sm">{String(item.name ?? "-")}</div>
                                            <Badge variant="secondary" className="mt-1 font-mono text-xs">
                                                {String(item.holiday_date ?? "").slice(0, 10)}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-background" onClick={() => openEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => void handleDelete(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
