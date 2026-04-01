"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Shift } from "@/types/admin-crud";
import { Clock3, Loader2, Pencil, Plus, RefreshCcw, RotateCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ShiftFormValues = {
    id?: number;
    name: string;
    startTime: string;
    endTime: string;
    gracePeriod: string;
};

type ShiftManagementProps = {
    shifts: Shift[];
    isLoading: boolean;
    isSaving: boolean;
    onRefresh: () => Promise<void>;
    onSearch: (keyword: string) => Promise<void>;
    onCreate: (payload: { name: string; start_time: string; end_time: string; grace_period?: number }) => Promise<void>;
    onUpdate: (id: number, payload: { name?: string; start_time?: string; end_time?: string; grace_period?: number }) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onRestore: (id: number) => Promise<void>;
};

const EMPTY_FORM: ShiftFormValues = {
    name: "",
    startTime: "",
    endTime: "",
    gracePeriod: "10",
};

function toTimeInputValue(value: unknown): string {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    const parts = raw.split(":");
    if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
    }
    return raw;
}

function toApiTime(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
    if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
    return trimmed;
}

export function ShiftManagement({ shifts, isLoading, isSaving, onRefresh, onSearch, onCreate, onUpdate, onDelete, onRestore }: ShiftManagementProps) {
    const [keyword, setKeyword] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<ShiftFormValues>(EMPTY_FORM);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void onSearch(keyword);
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [keyword, onSearch]);

    const sortedShifts = useMemo(() => {
        return [...shifts].sort((a, b) => Number(a.id) - Number(b.id));
    }, [shifts]);

    function openCreate() {
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    }

    function openEdit(shift: Shift) {
        setForm({
            id: Number(shift.id),
            name: String(shift.name ?? ""),
            startTime: toTimeInputValue(shift.start_time),
            endTime: toTimeInputValue(shift.end_time),
            gracePeriod: String(shift.grace_period ?? 0),
        });
        setDialogOpen(true);
    }

    async function submit() {
        if (!form.name.trim()) {
            toast.error("Vui lòng nhập tên ca làm.");
            return;
        }

        if (!form.startTime || !form.endTime) {
            toast.error("Vui lòng nhập giờ bắt đầu và giờ kết thúc.");
            return;
        }

        const gracePeriod = Number(form.gracePeriod || 0);
        if (!Number.isFinite(gracePeriod) || gracePeriod < 0) {
            toast.error("Thời gian cho phép đi trễ phải lớn hơn hoặc bằng 0.");
            return;
        }

        const payload = {
            name: form.name.trim(),
            start_time: toApiTime(form.startTime),
            end_time: toApiTime(form.endTime),
            grace_period: gracePeriod,
        };

        if (form.id) {
            await onUpdate(form.id, payload);
        } else {
            await onCreate(payload);
        }

        setDialogOpen(false);
        setForm(EMPTY_FORM);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle>Danh sách ca làm</CardTitle>
                        <CardDescription>Quản lý ca làm việc, thời gian bắt đầu/kết thúc và thời gian đi trễ cho phép.</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => void onRefresh()} disabled={isLoading || isSaving}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Làm mới
                        </Button>
                        <Button onClick={openCreate} disabled={isSaving}>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm ca làm
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid gap-2 md:grid-cols-3">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo tên ca làm..." className="pl-9" />
                    </div>
                    <div className="text-sm text-muted-foreground md:justify-self-end md:self-center">{shifts.length} ca làm</div>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Tên ca</th>
                                <th className="px-4 py-3">Thời gian</th>
                                <th className="px-4 py-3">Đi trễ cho phép</th>
                                <th className="px-4 py-3">Trạng thái</th>
                                <th className="px-4 py-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedShifts.map((shift) => {
                                const isActive = String(shift.status ?? "ACTIVE").toUpperCase() === "ACTIVE";

                                return (
                                    <tr key={shift.id} className="border-b align-top">
                                        <td className="px-4 py-3 font-medium">#{shift.id}</td>
                                        <td className="px-4 py-3">{String(shift.name ?? `Ca #${shift.id}`)}</td>
                                        <td className="px-4 py-3">
                                            {String(shift.start_time ?? "").slice(0, 5)} - {String(shift.end_time ?? "").slice(0, 5)}
                                        </td>
                                        <td className="px-4 py-3">{Number(shift.grace_period ?? 0)} phút</td>
                                        <td className="px-4 py-3">{isActive ? "Đang hoạt động" : "Đã ẩn"}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" disabled={isSaving || !isActive} onClick={() => openEdit(shift)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                {isActive ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isSaving}
                                                        onClick={() => {
                                                            if (!confirm(`Ẩn ca làm "${String(shift.name ?? `#${shift.id}`)}"?`)) return;
                                                            void onDelete(Number(shift.id));
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" size="sm" disabled={isSaving} onClick={() => void onRestore(Number(shift.id))}>
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!isLoading && sortedShifts.length === 0 && (
                                <tr>
                                    <td className="px-4 py-8 text-muted-foreground" colSpan={6}>
                                        Không có dữ liệu ca làm.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {isLoading && (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tải danh sách ca làm...
                    </div>
                )}
            </CardContent>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{form.id ? `Cập nhật ca #${form.id}` : "Thêm ca làm"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Tên ca làm</Label>
                            <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Giờ bắt đầu</Label>
                                <Input type="time" value={form.startTime} onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Giờ kết thúc</Label>
                                <Input type="time" value={form.endTime} onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Clock3 className="h-4 w-4" />
                                Thời gian đi trễ cho phép (phút)
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                value={form.gracePeriod}
                                onChange={(event) => setForm((prev) => ({ ...prev, gracePeriod: event.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                            Hủy
                        </Button>
                        <Button onClick={() => void submit()} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {form.id ? "Lưu thay đổi" : "Tạo ca làm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
