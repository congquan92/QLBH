"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types/navbar";
import { Loader2, Plus, Save } from "lucide-react";

export type CategoryForm = {
    id?: number;
    name: string;
    parentId: string; // "none" = danh mục gốc
    status: string;
};

export const emptyForm: CategoryForm = {
    name: "",
    parentId: "none",
    status: "ACTIVE",
};

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: CategoryForm;
    onFormChange: (form: CategoryForm) => void;
    categories: Category[];
    isSaving: boolean;
    onSubmit: () => void;
}

export function CategoryDialog({
    open,
    onOpenChange,
    form,
    onFormChange,
    categories,
    isSaving,
    onSubmit,
}: CategoryDialogProps) {
    const isEdit = !!form.id;
    const parentName = categories.find((c) => String(c.id) === form.parentId)?.name;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Cập nhật danh mục" : "Tạo danh mục mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Chỉnh sửa thông tin danh mục"
                            : "Nhập thông tin để tạo danh mục mới"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Tên danh mục */}
                    <div className="space-y-2">
                        <Label htmlFor="cat-name">Tên danh mục</Label>
                        <Input
                            id="cat-name"
                            value={form.name}
                            onChange={(e) =>
                                onFormChange({ ...form, name: e.target.value })
                            }
                            placeholder="Nhập tên danh mục"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onSubmit();
                            }}
                        />
                    </div>

                    {/* Danh mục cha */}
                    <div className="space-y-2">
                        <Label>Thuộc danh mục</Label>
                        <Select
                            value={form.parentId}
                            onValueChange={(val) =>
                                onFormChange({ ...form, parentId: val })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    — Không có (tạo danh mục cha) —
                                </SelectItem>
                                {categories
                                    .filter((c) => c.id !== form.id)
                                    .map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={String(cat.id)}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {form.parentId === "none" ? (
                                <span className="font-medium text-foreground">
                                    → Danh mục GỐC (cha)
                                </span>
                            ) : (
                                <>
                                    → Danh mục con của{" "}
                                    <span className="font-medium text-foreground">
                                        {parentName}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>

                    {/* Trạng thái (chỉ hiện khi edit) */}
                    {isEdit && (
                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select
                                value={form.status}
                                onValueChange={(val) =>
                                    onFormChange({ ...form, status: val })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">
                                        Kích hoạt
                                    </SelectItem>
                                    <SelectItem value="INACTIVE">
                                        Vô hiệu hóa
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                    >
                        Hủy
                    </Button>
                    <Button onClick={onSubmit} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : isEdit ? (
                            <Save className="mr-2 h-4 w-4" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        {isEdit ? "Lưu thay đổi" : "Tạo mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
