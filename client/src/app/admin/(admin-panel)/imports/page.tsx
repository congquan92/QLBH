"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Boxes, Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ImportProduct } from "@/types/admin-crud";

type ImportForm = {
    product_id: string;
    import_details: string;
};

type QuantityForm = {
    importDetailId: string;
    quantity: string;
};

const emptyImportForm: ImportForm = {
    product_id: "",
    import_details: '[{"product_variant_id":0,"quantity":1,"unitPrice":0}]',
};

const emptyQuantityForm: QuantityForm = {
    importDetailId: "",
    quantity: "1",
};

export default function ImportsPage() {
    const [imports, setImports] = useState<ImportProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<ImportForm>(emptyImportForm);
    const [editingImportId, setEditingImportId] = useState<number | null>(null);
    const [quantityForm, setQuantityForm] = useState<QuantityForm>(emptyQuantityForm);

    async function fetchImports() {
        setIsLoading(true);
        const response = await AdminCrudApi.getImportProducts({ page: 1, size: 100, sort: "id:desc" });
        setImports(response.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchImports();
    }, []);

    async function submitImport() {
        if (!form.product_id.trim()) {
            toast.error("Vui lòng nhập product_id.");
            return;
        }

        let details: Array<{ product_variant_id: number; quantity: number; unitPrice: number }> = [];
        try {
            details = JSON.parse(form.import_details) as Array<{ product_variant_id: number; quantity: number; unitPrice: number }>;
            if (!Array.isArray(details) || details.length === 0) {
                throw new Error("invalid details");
            }
        } catch {
            toast.error("`import_details` phải là JSON array hợp lệ.");
            return;
        }

        setIsSaving(true);
        try {
            await AdminCrudApi.createImportProduct({
                product_id: Number(form.product_id),
                import_details: details,
            });
            toast.success("Tạo phiếu nhập thành công.");
            setForm(emptyImportForm);
            await fetchImports();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function confirmImport(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.confirmImportProduct(id);
            toast.success("Xác nhận phiếu nhập thành công.");
            await fetchImports();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function cancelImport(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.cancelImportProduct(id);
            toast.success("Đã hủy phiếu nhập.");
            await fetchImports();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function deleteImport(id: number) {
        setIsSaving(true);
        try {
            await AdminCrudApi.deleteImportProduct(id);
            toast.success("Đã xóa phiếu nhập.");
            await fetchImports();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function submitQuantityUpdate() {
        if (!editingImportId || !quantityForm.importDetailId || !quantityForm.quantity) {
            toast.error("Vui lòng chọn phiếu nhập và nhập đủ `importDetailId`, `quantity`.");
            return;
        }

        setIsSaving(true);
        try {
            await AdminCrudApi.updateImportQuantities(editingImportId, {
                items: [
                    {
                        importDetailId: Number(quantityForm.importDetailId),
                        quantity: Number(quantityForm.quantity),
                    },
                ],
            });
            toast.success("Cập nhật số lượng chi tiết nhập thành công.");
            setEditingImportId(null);
            setQuantityForm(emptyQuantityForm);
            await fetchImports();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Nhập hàng" description="CRUD phiếu nhập theo endpoint `/import-products/*`">
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Tạo phiếu nhập</CardTitle>
                        <CardDescription>Payload gồm `product_id` và `import_details`</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <Label>Product ID</Label>
                            <Input value={form.product_id} onChange={(e) => setForm((prev) => ({ ...prev, product_id: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Import details (JSON)</Label>
                            <textarea className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.import_details} onChange={(e) => setForm((prev) => ({ ...prev, import_details: e.target.value }))} />
                        </div>
                        <Button onClick={() => void submitImport()} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Tạo phiếu nhập
                        </Button>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Danh sách phiếu nhập</CardTitle>
                        <CardDescription>{imports.length} bản ghi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tải...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {imports.map((item) => (
                                    <div key={item.id} className="rounded-md border p-3">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Boxes className="h-4 w-4" />
                                                    Import #{item.id}
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Supplier: {String(item.supplierName ?? "-")} | Status: {String(item.deliveryStatus ?? "-")}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Created: {String(item.createdAt ?? "-")}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button variant="outline" size="sm" onClick={() => void confirmImport(item.id)} disabled={isSaving}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => void cancelImport(item.id)} disabled={isSaving}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingImportId(item.id);
                                                        setQuantityForm(emptyQuantityForm);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => void deleteImport(item.id)} disabled={isSaving}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {imports.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu phiếu nhập.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {editingImportId !== null && (
                <Card>
                    <CardHeader>
                        <CardTitle>Cập nhật số lượng chi tiết nhập - Import #{editingImportId}</CardTitle>
                        <CardDescription>Dùng endpoint `/import-products/{"{id}"}/quantities`</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Import Detail ID</Label>
                                <Input value={quantityForm.importDetailId} onChange={(e) => setQuantityForm((prev) => ({ ...prev, importDetailId: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input value={quantityForm.quantity} onChange={(e) => setQuantityForm((prev) => ({ ...prev, quantity: e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => void submitQuantityUpdate()} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Lưu cập nhật số lượng
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditingImportId(null);
                                    setQuantityForm(emptyQuantityForm);
                                }}
                            >
                                Hủy
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </AdminPageShell>
    );
}
