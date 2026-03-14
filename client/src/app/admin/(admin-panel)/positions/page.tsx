"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BriefcaseBusiness, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Position } from "@/types/admin-crud";

type PositionForm = {
    id?: number;
    name: string;
    base_salary: string;
    salary_type: string;
};

const emptyForm: PositionForm = {
    name: "",
    base_salary: "",
    salary_type: "MONTHLY",
};

export default function PositionsPage() {
    const [positions, setPositions] = useState<Position[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<PositionForm>(emptyForm);

    async function fetchPositions() {
        setIsLoading(true);
        const response = await AdminCrudApi.getPositions({ page: 1, size: 100, sort: "id:desc" });
        setPositions(response.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchPositions();
    }, []);

    function resetForm() {
        setForm(emptyForm);
    }

    function startEdit(item: Position) {
        setForm({
            id: item.id,
            name: String(item.name ?? ""),
            base_salary: String(item.base_salary ?? ""),
            salary_type: String(item.salary_type ?? "MONTHLY"),
        });
    }

    async function submitPosition() {
        if (!form.name.trim() || !form.base_salary) {
            toast.error("Vui lòng nhập tên chức vụ và lương cơ bản.");
            return;
        }

        const payload = {
            name: form.name.trim(),
            base_salary: Number(form.base_salary),
            salary_type: form.salary_type,
        };

        setIsSaving(true);
        try {
            if (form.id) {
                await AdminCrudApi.updatePosition(form.id, payload);
                toast.success("Cập nhật chức vụ thành công.");
            } else {
                await AdminCrudApi.createPosition(payload);
                toast.success("Tạo chức vụ thành công.");
            }
            resetForm();
            await fetchPositions();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function removePosition(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.deletePosition(id);
            toast.success("Đã xóa chức vụ.");
            if (form.id === id) {
                resetForm();
            }
            await fetchPositions();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Chức vụ" description="CRUD chức vụ qua endpoint `/positions`">
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{form.id ? "Cập nhật chức vụ" : "Tạo chức vụ"}</CardTitle>
                        <CardDescription>Field theo `PositionRequest`</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <Label>Tên chức vụ</Label>
                            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Lương cơ bản</Label>
                            <Input value={form.base_salary} onChange={(e) => setForm((prev) => ({ ...prev, base_salary: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Loại lương</Label>
                            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.salary_type} onChange={(e) => setForm((prev) => ({ ...prev, salary_type: e.target.value }))}>
                                <option value="HOURLY">HOURLY</option>
                                <option value="MONTHLY">MONTHLY</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => void submitPosition()} disabled={isSaving}>
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
                        <CardTitle>Danh sách chức vụ</CardTitle>
                        <CardDescription>{positions.length} bản ghi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tải...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {positions.map((item) => (
                                    <div key={item.id} className="rounded-md border p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <BriefcaseBusiness className="h-4 w-4" />
                                                    {String(item.name ?? `Position #${item.id}`)}
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    base_salary: {String(item.base_salary ?? "-")} | salary_type: {String(item.salary_type ?? "-")}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => void removePosition(item.id)} disabled={isSaving}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {positions.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu chức vụ.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
