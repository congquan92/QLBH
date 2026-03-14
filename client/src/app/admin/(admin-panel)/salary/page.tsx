"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, Loader2, Pencil, Plus, Scale, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SalaryConfig, SalaryScale } from "@/types/admin-crud";

type SalaryConfigForm = {
    id?: number;
    rule_name: string;
    employee_type: string;
    multiplier: string;
    is_holiday: boolean;
};

type SalaryScaleForm = {
    id?: number;
    name: string;
    years_of_experience: string;
    coefficient: string;
};

const emptyConfigForm: SalaryConfigForm = {
    rule_name: "",
    employee_type: "FULL_TIME",
    multiplier: "1",
    is_holiday: false,
};

const emptyScaleForm: SalaryScaleForm = {
    name: "",
    years_of_experience: "0",
    coefficient: "1",
};

export default function SalaryPage() {
    const [configs, setConfigs] = useState<SalaryConfig[]>([]);
    const [scales, setScales] = useState<SalaryScale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [configForm, setConfigForm] = useState<SalaryConfigForm>(emptyConfigForm);
    const [scaleForm, setScaleForm] = useState<SalaryScaleForm>(emptyScaleForm);

    async function fetchData() {
        setIsLoading(true);
        const [configRes, scaleRes] = await Promise.all([AdminCrudApi.getSalaryConfigs({ page: 1, size: 100, sort: "id:desc" }), AdminCrudApi.getSalaryScales({ page: 1, size: 100, sort: "years_of_experience:asc" })]);
        setConfigs(configRes.data.data);
        setScales(scaleRes.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchData();
    }, []);

    function resetConfigForm() {
        setConfigForm(emptyConfigForm);
    }

    function resetScaleForm() {
        setScaleForm(emptyScaleForm);
    }

    function startEditConfig(item: SalaryConfig) {
        setConfigForm({
            id: item.id,
            rule_name: String(item.rule_name ?? ""),
            employee_type: String(item.employee_type ?? "FULL_TIME"),
            multiplier: String(item.multiplier ?? "1"),
            is_holiday: Boolean(item.is_holiday),
        });
    }

    function startEditScale(item: SalaryScale) {
        setScaleForm({
            id: item.id,
            name: String(item.name ?? ""),
            years_of_experience: String(item.years_of_experience ?? 0),
            coefficient: String(item.coefficient ?? 1),
        });
    }

    async function submitConfig() {
        if (!configForm.rule_name.trim()) {
            toast.error("Vui lòng nhập tên rule salary config.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                rule_name: configForm.rule_name.trim(),
                employee_type: configForm.employee_type,
                multiplier: Number(configForm.multiplier),
                is_holiday: configForm.is_holiday,
            };

            if (configForm.id) {
                await AdminCrudApi.updateSalaryConfig(configForm.id, payload);
                toast.success("Cập nhật salary config thành công.");
            } else {
                await AdminCrudApi.createSalaryConfig({ configs: [payload] });
                toast.success("Tạo salary config thành công.");
            }

            resetConfigForm();
            await fetchData();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function submitScale() {
        if (!scaleForm.name.trim()) {
            toast.error("Vui lòng nhập tên thang lương.");
            return;
        }

        const payload = {
            name: scaleForm.name.trim(),
            years_of_experience: Number(scaleForm.years_of_experience),
            coefficient: Number(scaleForm.coefficient),
        };

        setIsSaving(true);
        try {
            if (scaleForm.id) {
                await AdminCrudApi.updateSalaryScale(scaleForm.id, payload);
                toast.success("Cập nhật thang lương thành công.");
            } else {
                await AdminCrudApi.createSalaryScale(payload);
                toast.success("Tạo thang lương thành công.");
            }

            resetScaleForm();
            await fetchData();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function removeConfig(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.deleteSalaryConfig(id);
            toast.success("Đã xóa salary config.");
            if (configForm.id === id) {
                resetConfigForm();
            }
            await fetchData();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function removeScale(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.deleteSalaryScale(id);
            toast.success("Đã xóa thang lương.");
            if (scaleForm.id === id) {
                resetScaleForm();
            }
            await fetchData();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Lương" description="CRUD Salary Config và Salary Scale">
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{configForm.id ? "Cập nhật Salary Config" : "Tạo Salary Config"}</CardTitle>
                        <CardDescription>Endpoint `/salary-configs/*`</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <Label>Rule name</Label>
                            <Input value={configForm.rule_name} onChange={(e) => setConfigForm((prev) => ({ ...prev, rule_name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Employee type</Label>
                            <Input value={configForm.employee_type} onChange={(e) => setConfigForm((prev) => ({ ...prev, employee_type: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Multiplier</Label>
                            <Input value={configForm.multiplier} onChange={(e) => setConfigForm((prev) => ({ ...prev, multiplier: e.target.value }))} />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={configForm.is_holiday} onChange={(e) => setConfigForm((prev) => ({ ...prev, is_holiday: e.target.checked }))} />
                            Is holiday
                        </label>
                        <div className="flex gap-2">
                            <Button onClick={() => void submitConfig()} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                {configForm.id ? "Lưu" : "Tạo"}
                            </Button>
                            {configForm.id && (
                                <Button variant="outline" onClick={resetConfigForm}>
                                    Hủy
                                </Button>
                            )}
                        </div>
                        <div className="space-y-2 border-t pt-3">
                            {isLoading ? (
                                <p className="text-sm text-muted-foreground">Đang tải...</p>
                            ) : (
                                configs.map((item) => (
                                    <div key={item.id} className="rounded-md border p-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium flex items-center gap-2">
                                                    <Landmark className="h-4 w-4" />
                                                    {String(item.rule_name ?? `Config #${item.id}`)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {String(item.employee_type ?? "-")} | x{String(item.multiplier ?? "-")} | holiday: {String(item.is_holiday ?? false)}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => startEditConfig(item)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => void removeConfig(item.id)} disabled={isSaving}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {!isLoading && configs.length === 0 && <p className="text-sm text-muted-foreground">Không có salary config.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{scaleForm.id ? "Cập nhật Salary Scale" : "Tạo Salary Scale"}</CardTitle>
                        <CardDescription>Endpoint `/salary-scales/*`</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <Label>Tên thang lương</Label>
                            <Input value={scaleForm.name} onChange={(e) => setScaleForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label>Năm kinh nghiệm</Label>
                                <Input value={scaleForm.years_of_experience} onChange={(e) => setScaleForm((prev) => ({ ...prev, years_of_experience: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Hệ số</Label>
                                <Input value={scaleForm.coefficient} onChange={(e) => setScaleForm((prev) => ({ ...prev, coefficient: e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => void submitScale()} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                {scaleForm.id ? "Lưu" : "Tạo"}
                            </Button>
                            {scaleForm.id && (
                                <Button variant="outline" onClick={resetScaleForm}>
                                    Hủy
                                </Button>
                            )}
                        </div>
                        <div className="space-y-2 border-t pt-3">
                            {isLoading ? (
                                <p className="text-sm text-muted-foreground">Đang tải...</p>
                            ) : (
                                scales.map((item) => (
                                    <div key={item.id} className="rounded-md border p-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium flex items-center gap-2">
                                                    <Scale className="h-4 w-4" />
                                                    {String(item.name ?? `Scale #${item.id}`)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    exp: {String(item.years_of_experience ?? "-")} | coefficient: {String(item.coefficient ?? "-")}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => startEditScale(item)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => void removeScale(item.id)} disabled={isSaving}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {!isLoading && scales.length === 0 && <p className="text-sm text-muted-foreground">Không có thang lương.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
