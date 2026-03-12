"use client";

import { CategoryApi } from "@/api/category.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderTree, Loader2, Pencil, Plus, Trash2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Category } from "@/types/navbar";

type CategoryForm = {
    id?: number;
    name: string;
    parentId: string;
};

const emptyForm: CategoryForm = {
    name: "",
    parentId: "",
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<CategoryForm>(emptyForm);

    async function fetchData() {
        setIsLoading(true);
        const response = await CategoryApi.getAdminCategories({ page: 1, size: 100, sort: "id:desc" });
        setCategories(response.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchData();
    }, []);

    function resetForm() {
        setForm(emptyForm);
    }

    function startEdit(item: Category) {
        setForm({
            id: item.id,
            name: String(item.name ?? ""),
            parentId: String((item as { parentId?: number }).parentId ?? ""),
        });
    }

    async function submitCategory() {
        if (!form.name.trim()) {
            toast.error("Vui lòng nhập tên danh mục.");
            return;
        }

        const payload: Record<string, unknown> = {
            name: form.name.trim(),
        };
        if (form.parentId) {
            payload.parentId = Number(form.parentId);
        }
        if (form.id) {
            payload.id = form.id;
        }

        setIsSaving(true);
        try {
            if (form.id) {
                await CategoryApi.updateCategory(payload);
                toast.success("Cập nhật danh mục thành công.");
            } else {
                await CategoryApi.addCategory(payload);
                toast.success("Tạo danh mục thành công.");
            }
            resetForm();
            await fetchData();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Thao tác thất bại";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    }

    async function removeCategory(id: number) {
        if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

        setIsSaving(true);
        try {
            await CategoryApi.deleteCategory(id);
            toast.success("Đã xóa danh mục.");
            if (form.id === id) {
                resetForm();
            }
            await fetchData();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Thao tác thất bại";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleRestore(id: number) {
        setIsSaving(true);
        try {
            await CategoryApi.restoreCategory(id);
            toast.success("Đã khôi phục danh mục.");
            await fetchData();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Thao tác thất bại";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Danh mục" description="Quản lý cấu trúc danh mục và phân cấp sản phẩm">
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{form.id ? "Cập nhật danh mục" : "Tạo danh mục"}</CardTitle>
                        <CardDescription>Nhập thông tin danh mục sản phẩm</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <Label>Tên danh mục</Label>
                            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nhập tên danh mục" />
                        </div>
                        <div className="space-y-2">
                            <Label>Danh mục cha (ID)</Label>
                            <Input value={form.parentId} onChange={(e) => setForm((prev) => ({ ...prev, parentId: e.target.value }))} placeholder="Để trống nếu là danh mục gốc" />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => void submitCategory()} disabled={isSaving}>
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
                        <CardTitle>Tất cả danh mục</CardTitle>
                        <CardDescription>{categories.length} danh mục</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tải danh mục...
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <div key={category.id} className="rounded-md border p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <FolderTree className="h-4 w-4" />
                                                <span className="font-medium">{category.name}</span>
                                                <span className="text-xs text-muted-foreground">({category.childCategory?.length ?? 0} danh mục con)</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => startEdit(category)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => void removeCategory(category.id)} disabled={isSaving}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => void handleRestore(category.id)} disabled={isSaving} title="Khôi phục">
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {categories.length === 0 && <p className="text-sm text-muted-foreground">Không có danh mục.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
