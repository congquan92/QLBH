"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock3, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Shift } from "@/types/admin-crud";

type ShiftForm = {
    id?: number;
    name: string;
    start_time: string;
    end_time: string;
    grace_period: string;
};

const emptyForm: ShiftForm = {
    name: "",
    start_time: "08:00",
    end_time: "17:00",
    grace_period: "0",
};

function toApiTime(value: string) {
    return value.length === 5 ? `${value}:00` : value;
}

export default function ShiftsPage() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<ShiftForm>(emptyForm);

    async function fetchShifts() {
        setIsLoading(true);
        const response = await AdminCrudApi.getShifts({ page: 1, size: 100, sort: "id:desc" });
        setShifts(response.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchShifts();
    }, []);

    function resetForm() {
        setForm(emptyForm);
    }

    function startEdit(item: Shift) {
        setForm({
            id: item.id,
            name: String(item.name ?? ""),
            start_time: String(item.start_time ?? "08:00:00").slice(0, 5),
            end_time: String(item.end_time ?? "17:00:00").slice(0, 5),
            grace_period: String(item.grace_period ?? 0),
        });
    }

    async function submitShift() {
        if (!form.name.trim()) {
            toast.error("Tên ca làm việc không được để trống.");
            return;
        }

        const payload = {
            name: form.name.trim(),
            start_time: toApiTime(form.start_time),
            end_time: toApiTime(form.end_time),
            grace_period: Number(form.grace_period || 0),
        };

        setIsSaving(true);
        try {
            if (form.id) {
                await AdminCrudApi.updateShift(form.id, payload);
                toast.success("Cập nhật ca làm việc thành công.");
            } else {
                await AdminCrudApi.createShift(payload);
                toast.success("Tạo ca làm việc thành công.");
            }
            resetForm();
            await fetchShifts();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function removeShift(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.deleteShift(id);
            toast.success("Đã xóa ca làm việc.");
            if (form.id === id) {
                resetForm();
            }
            await fetchShifts();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Ca làm việc" description="CRUD ca làm việc theo endpoint `/shifts/*`">
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{form.id ? "Cập nhật ca" : "Tạo ca"}</CardTitle>
                        <CardDescription>Time format backend: `HH:mm:ss`</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <Label>Tên ca</Label>
                            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label>Giờ bắt đầu</Label>
                                <Input type="time" value={form.start_time} onChange={(e) => setForm((prev) => ({ ...prev, start_time: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Giờ kết thúc</Label>
                                <Input type="time" value={form.end_time} onChange={(e) => setForm((prev) => ({ ...prev, end_time: e.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Grace period (phút)</Label>
                            <Input value={form.grace_period} onChange={(e) => setForm((prev) => ({ ...prev, grace_period: e.target.value }))} />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => void submitShift()} disabled={isSaving}>
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
                        <CardTitle>Danh sách ca làm việc</CardTitle>
                        <CardDescription>{shifts.length} bản ghi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="rounded-md border p-3 flex items-center justify-between gap-3">
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-40" />
                                            <Skeleton className="h-3 w-56" />
                                        </div>
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {shifts.map((item) => (
                                    <div key={item.id} className="rounded-md border p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Clock3 className="h-4 w-4" />
                                                    {String(item.name ?? `Shift #${item.id}`)}
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {String(item.start_time ?? "-")} - {String(item.end_time ?? "-")} | grace: {String(item.grace_period ?? 0)} phút
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => void removeShift(item.id)} disabled={isSaving}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {shifts.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu ca làm việc.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
