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
import type { UserRank } from "@/types/admin-crud";
import { Loader2, Save, TicketPercent } from "lucide-react";

export type VoucherForm = {
    id?: number;
    description: string;
    type: string;
    discount_value: string;
    max_discount_value: string;
    min_discount_value: string;
    total_quantity: string;
    start_date: string;
    end_date: string;
    usage_limit_per_user: string;
    user_rank_id: string;
    is_shipping: boolean;
};

export const emptyForm: VoucherForm = {
    description: "",
    type: "PERCENTAGE",
    discount_value: "0",
    max_discount_value: "",
    min_discount_value: "0",
    total_quantity: "1",
    start_date: "",
    end_date: "",
    usage_limit_per_user: "1",
    user_rank_id: "",
    is_shipping: false,
};

interface VoucherFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: VoucherForm;
    onChange: (form: VoucherForm) => void;
    ranks: UserRank[];
    isSaving: boolean;
    onSubmit: () => void;
}

export function VoucherFormDialog({
    open,
    onOpenChange,
    form,
    onChange,
    ranks,
    isSaving,
    onSubmit,
}: VoucherFormDialogProps) {
    const isEditing = !!form.id;

    function update(patch: Partial<VoucherForm>) {
        onChange({ ...form, ...patch });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <TicketPercent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>
                                {isEditing ? "Cập nhật voucher" : "Tạo voucher mới"}
                            </DialogTitle>
                            <DialogDescription className="mt-0.5">
                                {isEditing
                                    ? "Chỉnh sửa thông tin chiến dịch khuyến mãi."
                                    : "Điền đầy đủ thông tin để tạo voucher mới."}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    {/* Mô tả */}
                    <div className="space-y-1.5">
                        <Label htmlFor="v-desc">
                            Mô tả <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="v-desc"
                            placeholder="VD: Giảm 20% cho đơn từ 200k"
                            value={form.description}
                            onChange={(e) => update({ description: e.target.value })}
                            autoFocus
                        />
                    </div>

                    {/* Loại voucher */}
                    <div className="space-y-1.5">
                        <Label>Loại giảm giá</Label>
                        <Select value={form.type} onValueChange={(val) => update({ type: val })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                                <SelectItem value="FIXED_AMOUNT">Cố định (VND)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Giá trị giảm + Giảm tối đa */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="v-discount">
                                Giá trị giảm <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="v-discount"
                                type="number"
                                min={0}
                                placeholder={form.type === "PERCENTAGE" ? "VD: 20" : "VD: 50000"}
                                value={form.discount_value}
                                onChange={(e) => update({ discount_value: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="v-max">Giảm tối đa (VND)</Label>
                            <Input
                                id="v-max"
                                type="number"
                                min={0}
                                placeholder="Để trống = không giới hạn"
                                value={form.max_discount_value}
                                onChange={(e) => update({ max_discount_value: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Đơn tối thiểu + Số lượng */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="v-min">Đơn tối thiểu (VND)</Label>
                            <Input
                                id="v-min"
                                type="number"
                                min={0}
                                placeholder="VD: 200000"
                                value={form.min_discount_value}
                                onChange={(e) => update({ min_discount_value: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="v-qty">
                                Tổng số lượng <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="v-qty"
                                type="number"
                                min={1}
                                placeholder="VD: 100"
                                value={form.total_quantity}
                                onChange={(e) => update({ total_quantity: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Ngày bắt đầu + Ngày kết thúc */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="v-start">Ngày bắt đầu</Label>
                            <Input
                                id="v-start"
                                type="date"
                                value={form.start_date}
                                onChange={(e) => update({ start_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="v-end">Ngày kết thúc</Label>
                            <Input
                                id="v-end"
                                type="date"
                                value={form.end_date}
                                onChange={(e) => update({ end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Giới hạn / user */}
                    <div className="space-y-1.5">
                        <Label htmlFor="v-limit">Giới hạn sử dụng / người dùng</Label>
                        <Input
                            id="v-limit"
                            type="number"
                            min={1}
                            placeholder="VD: 1"
                            value={form.usage_limit_per_user}
                            onChange={(e) => update({ usage_limit_per_user: e.target.value })}
                        />
                    </div>

                    {/* Hạng người dùng */}
                    <div className="space-y-1.5">
                        <Label>
                            Hạng khách hàng áp dụng <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={form.user_rank_id}
                            onValueChange={(val) => update({ user_rank_id: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn hạng..." />
                            </SelectTrigger>
                            <SelectContent>
                                {ranks.map((rank) => (
                                    <SelectItem key={rank.id} value={String(rank.id)}>
                                        {rank.name}{" "}
                                        <span className="text-muted-foreground text-xs">
                                            (min: {String(rank.minSpent ?? rank.min_spent)})
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Áp dụng vận chuyển */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <p className="text-sm font-medium">Áp dụng cho vận chuyển</p>
                            <p className="text-xs text-muted-foreground">
                                Voucher sẽ giảm phí ship thay vì giá sản phẩm
                            </p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={form.is_shipping}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ is_shipping: e.target.checked })}
                            />
                            <div className="peer h-6 w-11 rounded-full bg-input after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                        </label>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                    >
                        Hủy
                    </Button>
                    <Button onClick={onSubmit} disabled={isSaving} className="gap-2">
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isEditing ? "Lưu thay đổi" : "Tạo voucher"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
