"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Supplier } from "@/types/admin-crud";

type SupplierForm = {
    id?: number;
    name: string;
    phone: string;
    address: string;
    province: string;
    district: string;
    ward: string;
    provinceId: string;
    districtId: string;
    wardId: string;
    status: string;
};

const emptyForm: SupplierForm = {
    name: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    provinceId: "",
    districtId: "",
    wardId: "",
    status: "ACTIVE",
};

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<SupplierForm>(emptyForm);

    async function fetchSuppliers() {
        setIsLoading(true);
        const response = await AdminCrudApi.getSuppliers({ page: 1, size: 100, sort: "id:desc" });
        setSuppliers(response.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchSuppliers();
    }, []);

    function resetForm() {
        setForm(emptyForm);
    }

    function startEdit(item: Supplier) {
        setForm({
            id: item.id,
            name: String(item.name ?? ""),
            phone: String(item.phone ?? ""),
            address: String(item.address ?? ""),
            province: String(item.province ?? ""),
            district: String(item.district ?? ""),
            ward: String(item.ward ?? ""),
            provinceId: String((item as { provinceId?: number }).provinceId ?? ""),
            districtId: String((item as { districtId?: number }).districtId ?? ""),
            wardId: String((item as { wardId?: number }).wardId ?? ""),
            status: String(item.status ?? "ACTIVE"),
        });
    }

    async function submitSupplier() {
        if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
            toast.error("Vui lòng nhập đủ tên, số điện thoại và địa chỉ.");
            return;
        }

        const payload = {
            name: form.name.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            province: form.province.trim(),
            district: form.district.trim(),
            ward: form.ward.trim(),
            provinceId: Number(form.provinceId),
            districtId: Number(form.districtId),
            wardId: Number(form.wardId),
            status: form.status,
        };

        setIsSaving(true);
        try {
            if (form.id) {
                await AdminCrudApi.updateSupplier(form.id, payload);
                toast.success("Cập nhật nhà cung cấp thành công.");
            } else {
                await AdminCrudApi.createSupplier(payload);
                toast.success("Tạo nhà cung cấp thành công.");
            }
            resetForm();
            await fetchSuppliers();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function removeSupplier(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.deleteSupplier(id);
            toast.success("Đã vô hiệu hóa nhà cung cấp.");
            if (form.id === id) {
                resetForm();
            }
            await fetchSuppliers();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Nhà cung cấp" description="CRUD nhà cung cấp theo endpoint `/suppliers`">
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{form.id ? "Cập nhật nhà cung cấp" : "Tạo nhà cung cấp"}</CardTitle>
                        <CardDescription>Chuẩn field theo `SupplierCreationRequest`</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <Label>Tên</Label>
                            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Số điện thoại</Label>
                            <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Địa chỉ</Label>
                            <Input value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <Input placeholder="province" value={form.province} onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))} />
                            <Input placeholder="district" value={form.district} onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))} />
                            <Input placeholder="ward" value={form.ward} onChange={(e) => setForm((prev) => ({ ...prev, ward: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <Input placeholder="provinceId" value={form.provinceId} onChange={(e) => setForm((prev) => ({ ...prev, provinceId: e.target.value }))} />
                            <Input placeholder="districtId" value={form.districtId} onChange={(e) => setForm((prev) => ({ ...prev, districtId: e.target.value }))} />
                            <Input placeholder="wardId" value={form.wardId} onChange={(e) => setForm((prev) => ({ ...prev, wardId: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="DISABLED">DISABLED</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => void submitSupplier()} disabled={isSaving}>
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
                        <CardTitle>Danh sách nhà cung cấp</CardTitle>
                        <CardDescription>{suppliers.length} bản ghi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tải...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {suppliers.map((item) => (
                                    <div key={item.id} className="rounded-md border p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Building2 className="h-4 w-4" />
                                                    {String(item.name ?? `Supplier #${item.id}`)}
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {String(item.phone ?? "-")} | {String(item.status ?? "-")}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{String(item.address ?? "-")}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => void removeSupplier(item.id)} disabled={isSaving}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {suppliers.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu nhà cung cấp.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
