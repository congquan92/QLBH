"use client";

import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRank } from "@/types/admin-crud";
import { Helper } from "@/lib/helper";
import { Crown, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DeleteConfirmDialog } from "./_components/delete-confirm-dialog";
import { emptyForm, type UserRankForm, UserRankFormDialog } from "./_components/user-rank-form-dialog";
import { UserRankTable } from "./_components/user-rank-table";
import { UsersByRankDialog } from "./_components/users-by-rank-dialog";

export default function UserRanksPage() {
    const [ranks, setRanks] = useState<UserRank[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Dialog states
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [usersDialogOpen, setUsersDialogOpen] = useState(false);

    const [form, setForm] = useState<UserRankForm>(emptyForm);
    const [deleteTarget, setDeleteTarget] = useState<UserRank | null>(null);
    const [viewUsersRank, setViewUsersRank] = useState<UserRank | null>(null);

    async function fetchRanks() {
        setIsLoading(true);
        try {
            const response = await AdminCrudApi.getUserRanks({ page: 1, size: 50, sort: "min_spent:asc" });
            setRanks(response.data.data);
        } catch {
            toast.error("Không thể tải danh sách hạng.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void fetchRanks();
    }, []);

    function handleOpenCreate() {
        setForm(emptyForm);
        setFormDialogOpen(true);
    }

    function handleOpenEdit(item: UserRank) {
        setForm({
            id: item.id,
            name: String(item.name ?? ""),
            min_spent: String(item.minSpent ?? ""),
            status: String(item.status ?? "ACTIVE"),
        });
        setFormDialogOpen(true);
    }

    function handleOpenDelete(item: UserRank) {
        setDeleteTarget(item);
        setDeleteDialogOpen(true);
    }

    function handleOpenViewUsers(item: UserRank) {
        setViewUsersRank(item);
        setUsersDialogOpen(true);
    }

    async function handleSubmit() {
        if (!form.name.trim() || !form.min_spent) {
            toast.error("Vui lòng nhập tên hạng và mức chi tiêu tối thiểu.");
            return;
        }

        setIsSaving(true);
        try {
            if (form.id) {
                await AdminCrudApi.updateUserRank(form.id, {
                    name: form.name.trim(),
                    min_spent: Number(form.min_spent),
                    status: form.status ?? "ACTIVE",
                });
                toast.success("Cập nhật hạng thành công.");
            } else {
                await AdminCrudApi.createUserRank({
                    name: form.name.trim(),
                    minSpent: Number(form.min_spent),
                });
                toast.success("Tạo hạng thành viên thành công.");
            }
            setFormDialogOpen(false);
            setForm(emptyForm);
            await fetchRanks();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await AdminCrudApi.updateUserRank(deleteTarget.id, {
                name: deleteTarget.name,
                min_spent: Number(deleteTarget.minSpent),
                status: "DISABLED",
            });
            toast.success(`Đã vô hiệu hóa hạng "${String(deleteTarget.name)}".`);
            setDeleteDialogOpen(false);
            setDeleteTarget(null);
            await fetchRanks();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsDeleting(false);
        }
    }

    const activeCount = ranks.filter((r) => r.status === "ACTIVE").length;

    return (
        <AdminPageShell
            title="Xếp hạng khách hàng"
            description="Quản lý các hạng thành viên và mức chi tiêu tương ứng"
        >
            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Crown className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng hạng</p>
                            <p className="text-2xl font-bold">{ranks.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <Crown className="h-5 w-5 text-green-600" />
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
                            <Crown className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Vô hiệu / Tạm dừng</p>
                            <p className="text-2xl font-bold text-slate-600">{ranks.length - activeCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table Card */}
            <Card>
                <CardHeader className="flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base">Danh sách hạng thành viên</CardTitle>
                        <CardDescription>
                            {ranks.length} hạng · Nhấn <strong>Khách hàng</strong> để xem members theo từng hạng
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => void fetchRanks()}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                            Làm mới
                        </Button>
                        <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4" />
                            Thêm hạng mới
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <UserRankTable
                        ranks={ranks}
                        isLoading={isLoading}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                        onViewUsers={handleOpenViewUsers}
                    />
                </CardContent>
            </Card>

            {/* Form Dialog (Add/Edit) */}
            <UserRankFormDialog
                open={formDialogOpen}
                onOpenChange={(open) => {
                    setFormDialogOpen(open);
                    if (!open) setForm(emptyForm);
                }}
                form={form}
                onChange={setForm}
                onSubmit={() => void handleSubmit()}
                isSaving={isSaving}
            />

            {/* Delete Confirm Dialog */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setDeleteTarget(null);
                }}
                rankName={String(deleteTarget?.name ?? "")}
                onConfirm={() => void handleDelete()}
                isLoading={isDeleting}
            />

            {/* Users by Rank Dialog */}
            <UsersByRankDialog
                open={usersDialogOpen}
                onOpenChange={(open) => {
                    setUsersDialogOpen(open);
                    if (!open) setViewUsersRank(null);
                }}
                rank={viewUsersRank}
            />
        </AdminPageShell>
    );
}
