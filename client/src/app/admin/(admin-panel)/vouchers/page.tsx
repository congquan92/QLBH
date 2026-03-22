"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { VoucherApi } from "@/api/voucher.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Helper } from "@/lib/helper";
import type { UserRank } from "@/types/admin-crud";
import type { Voucher } from "@/types/voucher";
import { Plus, RefreshCw, TicketPercent } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DeleteConfirmDialog } from "./_components/delete-confirm-dialog";
import { emptyForm, type VoucherForm, VoucherFormDialog } from "./_components/voucher-form-dialog";
import { VoucherTable } from "./_components/voucher-table";

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

    // Dialog states
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [form, setForm] = useState<VoucherForm>(emptyForm);
    const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);

    // ── Fetch ──────────────────────────────────────────────
    async function fetchData() {
        setIsLoading(true);
        try {
            const [voucherRes, rankRes] = await Promise.all([
                VoucherApi.getAdminVouchers({ page: 1, size: 50, sort: "id:desc" }),
                AdminCrudApi.getUserRanks({ page: 1, size: 100 }),
            ]);
            setVouchers(voucherRes.data.data);
            setRanks(rankRes.data.data);
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void fetchData();
    }, []);

    // ── Open create dialog ──────────────────────────────────
    function handleOpenCreate() {
        setForm(emptyForm);
        setFormDialogOpen(true);
    }

    // ── Open edit dialog ────────────────────────────────────
    function handleOpenEdit(voucher: Voucher) {
        setForm({
            id: voucher.id,
            description: String(voucher.description ?? ""),
            type: String(voucher.type ?? "PERCENTAGE"),
            discount_value: String(voucher.discountValue ?? 0),
            max_discount_value: String(voucher.maxDiscountValue ?? ""),
            min_discount_value: String(voucher.minDiscountValue ?? 0),
            total_quantity: String(voucher.totalQuantity ?? voucher.remaining_quantity ?? 1),
            start_date: String(voucher.startDate ?? "").slice(0, 10),
            end_date: String(voucher.endDate ?? "").slice(0, 10),
            usage_limit_per_user: String(voucher.usageLimitPerUser ?? 1),
            user_rank_id: String(voucher.userRankResponse?.id ?? ""),
            is_shipping: Boolean(voucher.isShipping),
        });
        setFormDialogOpen(true);
    }

    // ── Open delete dialog ──────────────────────────────────
    function handleOpenDelete(voucher: Voucher) {
        setDeleteTarget(voucher);
        setDeleteDialogOpen(true);
    }

    // ── Submit create / edit ────────────────────────────────
    async function handleSubmit() {
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
            setFormDialogOpen(false);
            setForm(emptyForm);
            await fetchData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    // ── Confirm delete ──────────────────────────────────────
    async function handleDelete() {
        if (!deleteTarget) return;
        setIsSaving(true);
        try {
            // Soft-disable: update status to INACTIVE if API supports it;
            // fallback: send a dummy update to signal deactivation
            await VoucherApi.update(deleteTarget.id, {
                ...formToPayload({
                    ...emptyForm,
                    description: String(deleteTarget.description ?? ""),
                    type: String(deleteTarget.type ?? "PERCENTAGE"),
                    discount_value: String(deleteTarget.discountValue ?? 0),
                    user_rank_id: String(
                        (deleteTarget as { userRankId?: number }).userRankId ?? ""
                    ),
                }),
                status: "INACTIVE",
            });
            toast.success(`Đã vô hiệu hóa voucher.`);
            setDeleteDialogOpen(false);
            setDeleteTarget(null);
            await fetchData();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    const activeCount = vouchers.filter((v) => v.status === "ACTIVE").length;
    const expiredCount = vouchers.filter((v) => v.status === "EXPIRED").length;

    return (
        <AdminPageShell
            title="Voucher"
            description="Quản lý chiến dịch khuyến mãi và mã giảm giá"
        >
            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-3 mb-2">
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <TicketPercent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng voucher</p>
                            <p className="text-2xl font-bold">{vouchers.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <TicketPercent className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                            <TicketPercent className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Hết hạn</p>
                            <p className="text-2xl font-bold text-slate-500">{expiredCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main table card */}
            <Card>
                <CardHeader className="flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base">Danh sách voucher</CardTitle>
                        <CardDescription>
                            {vouchers.length} voucher · Sắp xếp mới nhất trước
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => void fetchData()}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                            Làm mới
                        </Button>
                        <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4" />
                            Thêm voucher
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <VoucherTable
                        vouchers={vouchers}
                        isLoading={isLoading}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                    />
                </CardContent>
            </Card>

            {/* Form Dialog (Add / Edit) */}
            <VoucherFormDialog
                open={formDialogOpen}
                onOpenChange={(open) => {
                    setFormDialogOpen(open);
                    if (!open) setForm(emptyForm);
                }}
                form={form}
                onChange={setForm}
                ranks={ranks}
                isSaving={isSaving}
                onSubmit={() => void handleSubmit()}
            />

            {/* Delete Confirm Dialog */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setDeleteTarget(null);
                }}
                voucherName={String(
                    deleteTarget?.name ?? deleteTarget?.code ?? deleteTarget?.description ?? ""
                )}
                onConfirm={() => void handleDelete()}
                isLoading={isSaving}
            />
        </AdminPageShell>
    );
}
