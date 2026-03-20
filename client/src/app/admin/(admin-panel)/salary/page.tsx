"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { SalaryApi } from "@/api/admin/salary.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { SalaryConfig, SalaryScale } from "@/types/admin-crud";
import type { SalaryBulkItem } from "@/types/salary";
import { Calculator, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SalaryConfigDialog, type SalaryConfigForm } from "./_components/SalaryConfigDialog";
import { SalaryConfigTable } from "./_components/SalaryConfigTable";
import { SalaryOverviewTable } from "./_components/SalaryOverviewTable";
import { SalaryScaleDialog, type SalaryScaleForm } from "./_components/SalaryScaleDialog";
import { SalaryScaleTable } from "./_components/SalaryScaleTable";
import { HolidayManagerDialog } from "./_components/HolidayManagerDialog";


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

    // Config dialog
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [configForm, setConfigForm] = useState<SalaryConfigForm>(emptyConfigForm);

    // Scale dialog
    const [scaleDialogOpen, setScaleDialogOpen] = useState(false);
    const [scaleForm, setScaleForm] = useState<SalaryScaleForm>(emptyScaleForm);

    // Holiday Manager dialog
    const [holidayManagerOpen, setHolidayManagerOpen] = useState(false);

    // Bảng lương tổng hợp
    const [overviewMonth, setOverviewMonth] = useState(String(new Date().getMonth() + 1));
    const [overviewYear, setOverviewYear] = useState(String(new Date().getFullYear()));
    const [overviewData, setOverviewData] = useState<SalaryBulkItem[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);

    async function fetchData() {
        setIsLoading(true);
        const [configRes, scaleRes] = await Promise.all([
            AdminCrudApi.getSalaryConfigs({ page: 1, size: 100, sort: "id:desc" }),
            AdminCrudApi.getSalaryScales({ page: 1, size: 100, sort: "years_of_experience:asc" }),
        ]);
        setConfigs(configRes.data.data);
        setScales(scaleRes.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchData();
    }, []);

    // ─── Config handlers ─────────────────────────────────────────
    function openAddConfig() {
        setConfigForm(emptyConfigForm);
        setConfigDialogOpen(true);
    }

    function openEditConfig(item: SalaryConfig) {
        setConfigForm({
            id: item.id,
            rule_name: String(item.rule_name ?? ""),
            employee_type: String(item.employee_type ?? "FULL_TIME"),
            multiplier: String(item.multiplier ?? "1"),
            is_holiday: Boolean(item.is_holiday),
        });
        setConfigDialogOpen(true);
    }

    async function handleSubmitConfig() {
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
            setConfigDialogOpen(false);
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteConfig(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.deleteSalaryConfig(id);
            toast.success("Đã xóa salary config.");
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra.");
        } finally {
            setIsSaving(false);
        }
    }

    // ─── Scale handlers ───────────────────────────────────────────
    function openAddScale() {
        setScaleForm(emptyScaleForm);
        setScaleDialogOpen(true);
    }

    function openEditScale(item: SalaryScale) {
        setScaleForm({
            id: item.id,
            name: String(item.name ?? ""),
            years_of_experience: String(item.years_of_experience ?? 0),
            coefficient: String(item.coefficient ?? 1),
        });
        setScaleDialogOpen(true);
    }

    async function handleSubmitScale() {
        if (!scaleForm.name.trim()) {
            toast.error("Vui lòng nhập tên thang lương.");
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                name: scaleForm.name.trim(),
                years_of_experience: Number(scaleForm.years_of_experience),
                coefficient: Number(scaleForm.coefficient),
            };
            if (scaleForm.id) {
                await AdminCrudApi.updateSalaryScale(scaleForm.id, payload);
                toast.success("Cập nhật thang lương thành công.");
            } else {
                await AdminCrudApi.createSalaryScale(payload);
                toast.success("Tạo thang lương thành công.");
            }
            setScaleDialogOpen(false);
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteScale(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.deleteSalaryScale(id);
            toast.success("Đã xóa thang lương.");
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra.");
        } finally {
            setIsSaving(false);
        }
    }

    // ─── Bulk salary calculate ────────────────────────────────────
    async function handleCalculateAll() {
        if (!overviewMonth || !overviewYear) {
            toast.error("Vui lòng chọn tháng và năm.");
            return;
        }
        setIsCalculating(true);
        try {
            const res = await SalaryApi.calculateAllSalaries(Number(overviewMonth), Number(overviewYear));
            const items = Array.isArray(res.data) ? res.data : [];
            setOverviewData(items);
            const errCount = items.filter((i) => i.status === "error").length;
            if (errCount > 0) {
                toast.warning(`Đã tính xong. ${errCount} nhân viên thiếu dữ liệu job history.`);
            } else {
                toast.success(`Đã tính lương cho ${items.length} nhân viên.`);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tính lương.");
        } finally {
            setIsCalculating(false);
        }
    }

    return (
        <AdminPageShell
            title="Quản lý Lương"
            description="Cấu hình hệ số lương, thang lương và xem bảng lương tổng hợp theo tháng"
        >
            {/* CRUD Config + Scale */}
            <div className="grid gap-6 lg:grid-cols-2">
                <SalaryConfigTable
                    configs={configs}
                    isLoading={isLoading}
                    isSaving={isSaving}
                    onAdd={openAddConfig}
                    onEdit={openEditConfig}
                    onDelete={handleDeleteConfig}
                    onOpenHolidayManager={() => setHolidayManagerOpen(true)}
                />
                <SalaryScaleTable
                    scales={scales}
                    isLoading={isLoading}
                    isSaving={isSaving}
                    onAdd={openAddScale}
                    onEdit={openEditScale}
                    onDelete={handleDeleteScale}
                />
            </div>

            <Separator className="my-6" />

            {/* Bảng lương tổng hợp */}
            <div>
                <h2 className="text-lg font-semibold mb-1">Bảng Lương Tổng Hợp</h2>
                <p className="text-sm text-muted-foreground mb-4">Chọn tháng và năm để tính lương cho tất cả nhân viên cùng lúc.</p>

                <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-1.5">
                        <Label>Tháng</Label>
                        <Select value={overviewMonth} onValueChange={setOverviewMonth}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <SelectItem key={m} value={String(m)}>
                                        Tháng {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Năm</Label>
                        <Input
                            type="number"
                            className="w-28"
                            min={2020}
                            max={2100}
                            value={overviewYear}
                            onChange={(e) => setOverviewYear(e.target.value)}
                        />
                    </div>

                    <Button onClick={() => void handleCalculateAll()} disabled={isCalculating}>
                        {isCalculating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tính...
                            </>
                        ) : (
                            <>
                                <Calculator className="mr-2 h-4 w-4" />
                                Tính lương tất cả
                            </>
                        )}
                    </Button>
                </div>

                <SalaryOverviewTable
                    data={overviewData}
                    isLoading={isCalculating}
                    month={Number(overviewMonth)}
                    year={Number(overviewYear)}
                />
            </div>

            {/* Dialogs */}
            <SalaryConfigDialog
                open={configDialogOpen}
                form={configForm}
                isSaving={isSaving}
                onChange={setConfigForm}
                onSubmit={() => void handleSubmitConfig()}
                onClose={() => setConfigDialogOpen(false)}
            />
            <SalaryScaleDialog
                open={scaleDialogOpen}
                form={scaleForm}
                isSaving={isSaving}
                onChange={setScaleForm}
                onSubmit={() => void handleSubmitScale()}
                onClose={() => setScaleDialogOpen(false)}
            />
            <HolidayManagerDialog
                open={holidayManagerOpen}
                onClose={() => setHolidayManagerOpen(false)}
            />
        </AdminPageShell>
    );
}
