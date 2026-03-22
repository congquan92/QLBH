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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helper } from "@/lib/helper";
import { Crown, Loader2, Save } from "lucide-react";

export type UserRankForm = {
    id?: number;
    name: string;
    min_spent: string;
    status?: string;
};

export const emptyForm: UserRankForm = {
    name: "",
    min_spent: "",
};

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Đang hoạt động", className: "text-green-700" },
    { value: "INACTIVE", label: "Không hoạt động", className: "text-yellow-600" },
    { value: "DISABLED", label: "Đã vô hiệu hóa", className: "text-red-600" },
];

interface UserRankFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UserRankForm;
    onChange: (form: UserRankForm) => void;
    onSubmit: () => void;
    isSaving: boolean;
}

export function UserRankFormDialog({
    open,
    onOpenChange,
    form,
    onChange,
    onSubmit,
    isSaving,
}: UserRankFormDialogProps) {
    const isEditing = !!form.id;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Crown className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>
                                {isEditing ? "Cập nhật hạng thành viên" : "Thêm hạng thành viên mới"}
                            </DialogTitle>
                            <DialogDescription className="mt-0.5">
                                {isEditing
                                    ? "Chỉnh sửa thông tin hạng thành viên hiện có."
                                    : "Tạo một hạng thành viên mới cho khách hàng."}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Tên hạng */}
                    <div className="space-y-1.5">
                        <Label htmlFor="rank-name">
                            Tên hạng <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="rank-name"
                            placeholder="VD: DIAMOND, GOLD, SILVER..."
                            value={form.name}
                            onChange={(e) => onChange({ ...form, name: e.target.value })}
                            className="uppercase placeholder:normal-case"
                        />
                    </div>

                    {/* Mức chi tiêu */}
                    <div className="space-y-1.5">
                        <Label htmlFor="min-spent">
                            Mức chi tiêu tối thiểu (VND) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="min-spent"
                            type="number"
                            min={0}
                            placeholder="VD: 10000000"
                            value={form.min_spent}
                            onChange={(e) => onChange({ ...form, min_spent: e.target.value })}
                        />
                        {form.min_spent && !isNaN(Number(form.min_spent)) && (
                            <p className="text-xs text-muted-foreground">
                                ≈ <span className="font-medium text-foreground">{Helper.formatCurrency(form.min_spent)}</span>
                            </p>
                        )}
                    </div>

                    {/* Trạng thái (chỉ khi edit) */}
                    {isEditing && (
                        <div className="space-y-1.5">
                            <Label>Trạng thái</Label>
                            <Select
                                value={form.status ?? "ACTIVE"}
                                onValueChange={(val) => onChange({ ...form, status: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            <span className={opt.className}>{opt.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit} disabled={isSaving} className="gap-2">
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isEditing ? "Lưu thay đổi" : "Tạo hạng"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
