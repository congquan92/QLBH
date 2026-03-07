"use client";

import { AdminCrudApi } from "@/api/admin-crud.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Holiday } from "@/types/admin-crud";

type HolidayForm = {
    id?: number;
    name: string;
    holiday_date: string;
};

const emptyForm: HolidayForm = {
    name: "",
    holiday_date: "",
};

export default function HolidaysPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<HolidayForm>(emptyForm);

    async function fetchHolidays() {
        setIsLoading(true);
        const response = await AdminCrudApi.getHolidays({ page: 1, size: 100, sort: "holiday_date:asc" });
        setHolidays(response.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchHolidays();
    }, []);

    function resetForm() {
        setForm(emptyForm);
    }

    function startEdit(item: Holiday) {
        setForm({
            id: item.id,
            name: String(item.name ?? ""),
            holiday_date: String(item.holiday_date ?? "").slice(0, 10),
        });
    }

    async function submitHoliday() {
        if (!form.name.trim() || !form.holiday_date) {
            toast.error("Vui lòng nhập tên ngày lễ và ngày nghỉ.");
            return;
        }

        setIsSaving(true);
        try {
            if (form.id) {
                await AdminCrudApi.updateHoliday(form.id, {
                    name: form.name.trim(),
                    holiday_date: form.holiday_date,
                });
                toast.success("Cập nhật ngày lễ thành công.");
            } else {
                await AdminCrudApi.createHoliday({
                    name: form.name.trim(),
                    holiday_date: form.holiday_date,
                });
                toast.success("Tạo ngày lễ thành công.");
            }
            resetForm();
            await fetchHolidays();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function removeHoliday(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.deleteHoliday(id);
            toast.success("Đã xóa ngày lễ.");
            if (form.id === id) {
                resetForm();
            }
            await fetchHolidays();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Ngày lễ" description="CRUD ngày nghỉ lễ theo endpoint `/holidays/*`">
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{form.id ? "Cập nhật ngày lễ" : "Tạo ngày lễ"}</CardTitle>
                        <CardDescription>Field chuẩn: `name`, `holiday_date`</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <Label>Tên ngày lễ</Label>
                            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Ngày nghỉ</Label>
                            <Input type="date" value={form.holiday_date} onChange={(e) => setForm((prev) => ({ ...prev, holiday_date: e.target.value }))} />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => void submitHoliday()} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                {form.id ? "Lưu" : "Tạo"}
                            </Button>
                            {form.id && (
                                <Button variant="outline" onClick={resetForm}>
                                    Hủy
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Danh sách ngày lễ</CardTitle>
                        <CardDescription>{holidays.length} bản ghi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tải...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {holidays.map((item) => (
                                    <div key={item.id} className="rounded-md border p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <CalendarDays className="h-4 w-4" />
                                                    {String(item.name ?? `Holiday #${item.id}`)}
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">{String(item.holiday_date ?? "-")}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => void removeHoliday(item.id)} disabled={isSaving}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {holidays.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu ngày lễ.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
