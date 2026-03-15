"use client";

import { CategoryApi } from "@/api/category.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category, CategoryChild } from "@/types/navbar";
import { ChevronDown, ChevronRight, FolderTree, Loader2, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Helper } from "@/lib/helper";

type CategoryForm = {
    id?: number;
    name: string;
    parentId: string; // "none" = danh mục gốc
    status: string;
};

const emptyForm: CategoryForm = { name: "", parentId: "none", status: "ACTIVE" };

type AnyCategory = Category | CategoryChild;

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<CategoryForm>(emptyForm);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    async function fetchData() {
        setIsLoading(true);
        const response = await CategoryApi.getAdminCategories({ page: 1, size: 200 });
        setCategories(response.data);
        console.log("Fetched categories:", response.data);
        const initExpanded: Record<number, boolean> = {};
        for (const cat of response.data) {
            if ((cat.childCategory?.length ?? 0) > 0) initExpanded[cat.id] = true;
        }
        setExpanded(initExpanded);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchData();
    }, []);

    function resetForm() {
        setForm(emptyForm);
    }

    function startEdit(item: AnyCategory, parentId?: number) {
        setForm({
            id: item.id,
            name: String(item.name ?? ""),
            parentId: parentId != null ? String(parentId) : "none",
            status: String(item.status ?? "ACTIVE"),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function toggleExpand(id: number) {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    async function submitCategory() {
        if (!form.name.trim()) {
            toast.error("Vui lòng nhập tên danh mục.");
            return;
        }

        setIsSaving(true);
        try {
            if (form.id) {
                const payload: Record<string, unknown> = {
                    id: form.id,
                    name: form.name.trim(),
                    status: form.status,
                };
                if (form.parentId && form.parentId !== "none") {
                    payload.parentId = Number(form.parentId);
                }
                await CategoryApi.updateCategory(payload);
                toast.success("Cập nhật danh mục thành công.");
            } else {
                const payload: Record<string, unknown> = {
                    name: form.name.trim(),
                    childCategories: [],
                };
                if (form.parentId && form.parentId !== "none") {
                    payload.parentId = Number(form.parentId);
                }
                await CategoryApi.addCategory(payload);
                toast.success("Tạo danh mục thành công.");
            }
            resetForm();
            await fetchData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
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
            if (form.id === id) resetForm();
            await fetchData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
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
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    const totalCount = categories?.reduce((acc, cat) => acc + 1 + (cat.childCategory?.length ?? 0), 0);

    return (
        <AdminPageShell title="Danh mục" description="Quản lý cấu trúc danh mục và phân cấp sản phẩm">
            <div className="grid gap-4 lg:grid-cols-3">
                {/* ── Form ── */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>{form.id ? "Cập nhật danh mục" : "Tạo danh mục"}</CardTitle>
                        <CardDescription>Nhập thông tin danh mục sản phẩm</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tên danh mục</Label>
                            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nhập tên danh mục" />
                        </div>
                        <div className="space-y-2">
                            <Label>Thuộc danh mục</Label>
                            <Select value={form.parentId} onValueChange={(val) => setForm((prev) => ({ ...prev, parentId: val }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">— Không có (tạo danh mục cha) —</SelectItem>
                                    {categories?.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {form.parentId === "none" ? (
                                    <span className="font-medium text-foreground">→ Danh mục GỐC (cha)</span>
                                ) : (
                                    <>
                                        → Danh mục con của <span className="font-medium text-foreground">{categories.find((c) => String(c.id) === form.parentId)?.name}</span>
                                    </>
                                )}
                            </p>
                        </div>
                        {form.id && (
                            <div className="space-y-2">
                                <Label>Trạng thái</Label>
                                <Select value={form.status} onValueChange={(val) => setForm((prev) => ({ ...prev, status: val }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Kích hoạt</SelectItem>
                                        <SelectItem value="INACTIVE">Vô hiệu hóa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button onClick={() => void submitCategory()} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                {form.id ? "Lưu thay đổi" : "Tạo mới"}
                            </Button>
                            {form.id && (
                                <Button variant="outline" onClick={resetForm}>
                                    Hủy
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Category tree ── */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Tất cả danh mục</CardTitle>
                        <CardDescription>
                            {totalCount} danh mục ({categories?.length} danh mục gốc)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang tải danh mục...
                            </div>
                        ) : categories?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Không có danh mục.</p>
                        ) : (
                            <div className="space-y-2">
                                {categories?.map((category) => {
                                    const hasChildren = (category.childCategory?.length ?? 0) > 0;
                                    const isExpanded = !!expanded[category.id];
                                    const isActive = category.status === "ACTIVE";

                                    return (
                                        <div key={category.id} className="rounded-md border">
                                            {/* Parent row */}
                                            <div className="flex items-center justify-between gap-3 p-3">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <button type="button" onClick={() => toggleExpand(category.id)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" disabled={!hasChildren}>
                                                        {hasChildren ? isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" /> : <FolderTree className="h-4 w-4 opacity-30" />}
                                                    </button>
                                                    <span className="font-medium truncate">{category.name}</span>
                                                    {hasChildren && (
                                                        <Badge variant="secondary" className="shrink-0 text-xs">
                                                            {category.childCategory.length} con
                                                        </Badge>
                                                    )}
                                                    <Badge variant={isActive ? "default" : "destructive"} className="shrink-0 text-xs">
                                                        {isActive ? "Kích hoạt" : "Đã xóa"}
                                                    </Badge>
                                                </div>
                                                <div className="flex shrink-0 gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => startEdit(category)} title="Chỉnh sửa">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => void removeCategory(category.id)} disabled={isSaving} title="Xóa">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => void handleRestore(category.id)} disabled={isSaving} title="Khôi phục">
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Children */}
                                            {hasChildren && isExpanded && (
                                                <div className="border-t bg-muted/30 px-3 pb-3 pt-2 space-y-1.5">
                                                    {category.childCategory.map((child) => {
                                                        const childActive = child.status === "ACTIVE";
                                                        return (
                                                            <div key={child.id} className="flex items-center justify-between gap-3 rounded-sm border bg-background px-3 py-2">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="ml-4 text-sm truncate">{child.name}</span>
                                                                    <Badge variant={childActive ? "outline" : "destructive"} className="shrink-0 text-xs">
                                                                        {childActive ? "Kích hoạt" : "Đã xóa"}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex shrink-0 gap-1">
                                                                    <Button variant="ghost" size="sm" onClick={() => startEdit(child, category.id)} title="Chỉnh sửa">
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" onClick={() => void removeCategory(child.id)} disabled={isSaving} title="Xóa">
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" onClick={() => void handleRestore(child.id)} disabled={isSaving} title="Khôi phục">
                                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
