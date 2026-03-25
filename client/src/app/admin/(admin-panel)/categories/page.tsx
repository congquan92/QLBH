"use client";

import { CategoryApi } from "@/api/category.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Helper } from "@/lib/helper";
import type { Category, CategoryChild } from "@/types/navbar";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CategoryDialog, emptyForm, type CategoryForm } from "./_components/category-dialog";
import { CategoryTree } from "./_components/category-tree";
import { DeleteConfirmDialog } from "./_components/delete-confirm-dialog";

type AnyCategory = Category | CategoryChild;

type DeleteTarget = {
    id: number;
    name: string;
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [treeVersion, setTreeVersion] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<CategoryForm>(emptyForm);
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

    // ──────────────────────────────────────────────
    function normalizeCategoryList(payload: unknown): Category[] {
        if (Array.isArray(payload)) {
            return payload as Category[];
        }

        if (payload && typeof payload === "object") {
            const nested = (payload as { data?: unknown }).data;
            if (Array.isArray(nested)) {
                return nested as Category[];
            }
        }

        return [];
    }

    async function fetchData() {
        setIsLoading(true);
        try {
            const response = await CategoryApi.getAdminCategories({ page: 1, size: 200 });
            setCategories(normalizeCategoryList(response.data));
            setTreeVersion((prev) => prev + 1);
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void fetchData();
    }, []);

    // ── Open dialog for create ──
    function openCreateDialog() {
        setForm(emptyForm);
        setDialogOpen(true);
    }

    // ── Open dialog for edit ──
    function openEditDialog(item: AnyCategory, parentId?: number) {
        setForm({
            id: item.id,
            name: String(item.name ?? ""),
            parentId: parentId != null ? String(parentId) : "none",
            status: String(item.status ?? "ACTIVE"),
        });
        setDialogOpen(true);
    }

    // ── Close dialog ──
    function closeDialog(open: boolean) {
        setDialogOpen(open);
        if (!open) setForm(emptyForm);
    }

    // ── Submit create/edit ──
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
            closeDialog(false);
            await fetchData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    // ── Open delete dialog ──
    function openDeleteDialog(item: AnyCategory) {
        setDeleteTarget({ id: item.id, name: String(item.name) });
    }

    // ── Confirm delete ──
    async function confirmDelete() {
        if (!deleteTarget) return;
        setIsSaving(true);
        try {
            await CategoryApi.deleteCategory(deleteTarget.id);
            toast.success("Đã xóa danh mục.");
            setDeleteTarget(null);
            await fetchData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    // ── Restore ──
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

    // Nên ta so sánh trước/sau và chỉ gọi API cho những item đổi parent
    async function handleReorder(newCategories: Category[]) {
        // Xây map parentId hiện tại trên server (categories gốc chưa sửa)
        const oldParentMap = new Map<number, number | null>();
        for (const cat of categories) {
            oldParentMap.set(cat.id, null); // cha gốc không có parent
            for (const child of cat.childCategory ?? []) {
                oldParentMap.set(child.id, cat.id);
            }
        }

        // Tìm những item thay đổi parentId
        const toMove: { categoryId: number; categoryParentId: number | null }[] = [];
        for (const cat of newCategories) {
            if (oldParentMap.get(cat.id) !== null) {
                // Danh mục cha bị kéo thành con → gỡ parent
                toMove.push({ categoryId: cat.id, categoryParentId: null });
            }
            for (const child of cat.childCategory ?? []) {
                const oldParent = oldParentMap.get(child.id);
                if (oldParent !== cat.id) {
                    toMove.push({ categoryId: child.id, categoryParentId: cat.id });
                }
            }
        }

        if (toMove.length === 0) {
            toast.info("Không có thay đổi nào để lưu.");
            return;
        }

        try {
            // Gọi API lần lượt cho từng item thay đổi
            for (const payload of toMove) {
                await CategoryApi.moveCategory(payload);
            }
            toast.success("Đã lưu thứ tự danh mục.");
            await fetchData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
            throw error; // báo cho tree biết để giữ dirty state
        }
    }

    return (
        <AdminPageShell title="Danh mục" description="Quản lý cấu trúc danh mục và phân cấp sản phẩm">
            {/* Top action bar */}
            <div className="flex items-center justify-end mb-4">
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo danh mục
                </Button>
            </div>

            {/* Category tree */}
            <CategoryTree key={treeVersion} categories={categories} isLoading={isLoading} isSaving={isSaving} onEdit={openEditDialog} onDelete={openDeleteDialog} onRestore={(id) => void handleRestore(id)} onReorder={handleReorder} />

            {/* Create / Edit Dialog */}
            <CategoryDialog open={dialogOpen} onOpenChange={closeDialog} form={form} onFormChange={setForm} categories={categories} isSaving={isSaving} onSubmit={() => void submitCategory()} />

            {/* Delete Confirm Dialog */}
            <DeleteConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                categoryName={deleteTarget?.name ?? ""}
                isSaving={isSaving}
                onConfirm={() => void confirmDelete()}
            />
        </AdminPageShell>
    );
}
