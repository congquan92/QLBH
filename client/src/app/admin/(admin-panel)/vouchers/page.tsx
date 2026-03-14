"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { VoucherApi } from "@/api/voucher.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Plus, TicketPercent } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserRank } from "@/types/admin-crud";
import type { Voucher } from "@/types/voucher";

type VoucherForm = {
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

const emptyForm: VoucherForm = {
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

function formToPayload(form: VoucherForm) {
    return {
        description: form.description,
        type: form.type,
        discount_value: Number(form.discount_value),
        max_discount_value: form.max_discount_value ? Number(form.max_discount_value) : null,
        min_discount_value: form.min_discount_value ? Number(form.min_discount_value) : 0,
        total_quantity: Number(form.total_quantity),
        start_date: form.start_date,
        end_date: form.end_date,
        usage_limit_per_user: form.usage_limit_per_user ? Number(form.usage_limit_per_user) : null,
        user_rank_id: Number(form.user_rank_id),
        is_shipping: form.is_shipping,
    };
}

export default function VouchersPage() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [ranks, setRanks] = useState<UserRank[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<VoucherForm>(emptyForm);

    async function fetchData() {
        setIsLoading(true);
        const [voucherRes, rankRes] = await Promise.all([VoucherApi.getAdminVouchers({ page: 1, size: 50, sort: "id:desc" }), AdminCrudApi.getUserRanks({ page: 1, size: 100 })]);
        setVouchers(voucherRes.data.data);
        setRanks(rankRes.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchData();
    }, []);

    function resetForm() {
        setForm(emptyForm);
    }

    function startEdit(voucher: Voucher) {
        setForm({
            id: voucher.id,
            description: String(voucher.description ?? ""),
            type: String(voucher.type ?? "PERCENTAGE"),
            discount_value: String(voucher.discountValue ?? 0),
            max_discount_value: String(voucher.maxDiscountValue ?? ""),
            min_discount_value: String(voucher.minDiscountValue ?? 0),
            total_quantity: String((voucher as { totalQuantity?: number }).totalQuantity ?? voucher.remainingQuantity ?? 1),
            start_date: String(voucher.startDate ?? "").slice(0, 10),
            end_date: String(voucher.endDate ?? "").slice(0, 10),
            usage_limit_per_user: String((voucher as { usageLimitPerUser?: number }).usageLimitPerUser ?? 1),
            user_rank_id: String((voucher as { userRankId?: number }).userRankId ?? ""),
            is_shipping: Boolean((voucher as { isShipping?: boolean }).isShipping),
        });
    }

    async function submitVoucher() {
        if (!form.description.trim() || !form.user_rank_id) {
            toast.error("Vui lòng nhập mô tả và chọn hạng người dùng.");
            return;
        }

        setIsSaving(true);
        try {
            if (form.id) {
                await VoucherApi.update(form.id, formToPayload(form));
                toast.success("Cập nhật voucher thành công.");
            } else {
                await VoucherApi.create(formToPayload(form));
                toast.success("Tạo voucher thành công.");
            }
            resetForm();
            await fetchData();
        } catch (error) {
            const message = AdminCrudApi.toErrorMessage(error);
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Voucher" description="CRUD chiến dịch khuyến mãi và mã giảm giá" requiredPermissions={["VIEW_ALL_VOUCHER"]}>
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{form.id ? "Cập nhật voucher" : "Tạo voucher"}</CardTitle>
                        <CardDescription>Đầy đủ field theo `VoucherCreationRequest`</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="voucher-description">Mô tả</Label>
                            <Input id="voucher-description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="voucher-type">Loại voucher</Label>
                            <select id="voucher-type" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
                                <option value="PERCENTAGE">PERCENTAGE</option>
                                <option value="FIXED">FIXED</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="discount_value" value={form.discount_value} onChange={(e) => setForm((prev) => ({ ...prev, discount_value: e.target.value }))} />
                            <Input placeholder="max_discount_value" value={form.max_discount_value} onChange={(e) => setForm((prev) => ({ ...prev, max_discount_value: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="min_discount_value" value={form.min_discount_value} onChange={(e) => setForm((prev) => ({ ...prev, min_discount_value: e.target.value }))} />
                            <Input placeholder="total_quantity" value={form.total_quantity} onChange={(e) => setForm((prev) => ({ ...prev, total_quantity: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input type="date" value={form.start_date} onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))} />
                            <Input type="date" value={form.end_date} onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))} />
                        </div>
                        <Input placeholder="usage_limit_per_user" value={form.usage_limit_per_user} onChange={(e) => setForm((prev) => ({ ...prev, usage_limit_per_user: e.target.value }))} />
                        <div className="space-y-2">
                            <Label htmlFor="voucher-rank">Hạng người dùng</Label>
                            <select id="voucher-rank" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.user_rank_id} onChange={(e) => setForm((prev) => ({ ...prev, user_rank_id: e.target.value }))}>
                                <option value="">Chọn hạng</option>
                                {ranks.map((rank) => (
                                    <option key={rank.id} value={rank.id}>
                                        {rank.name} (min_spent: {rank.min_spent})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.is_shipping} onChange={(e) => setForm((prev) => ({ ...prev, is_shipping: e.target.checked }))} />
                            Áp dụng cho vận chuyển (`is_shipping`)
                        </label>

                        <div className="flex gap-2">
                            <Button onClick={() => void submitVoucher()} disabled={isSaving}>
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
                        <CardTitle>Danh sách voucher</CardTitle>
                        <CardDescription>{vouchers.length} voucher gần nhất</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tải dữ liệu voucher...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {vouchers.map((voucher) => (
                                    <div key={voucher.id} className="rounded-md border p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <TicketPercent className="h-4 w-4" />
                                                    {String(voucher.name ?? voucher.code ?? `Voucher #${voucher.id}`)}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Mã: {String(voucher.code ?? "-")} | Trạng thái: {String(voucher.status ?? "-")}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Giá trị giảm: {String(voucher.discountValue ?? "-")} | Còn lại: {String(voucher.remainingQuantity ?? "-")}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => startEdit(voucher)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {vouchers.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu voucher.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
