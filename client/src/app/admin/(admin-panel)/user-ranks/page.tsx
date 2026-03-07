"use client";

import { AdminCrudApi } from "@/api/admin-crud.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Loader2, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserRank } from "@/types/admin-crud";

type UserRankForm = {
    id?: number;
    name: string;
    min_spent: string;
};

const emptyForm: UserRankForm = {
    name: "",
    min_spent: "",
};

export default function UserRanksPage() {
    const [ranks, setRanks] = useState<UserRank[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<UserRankForm>(emptyForm);

    async function fetchRanks() {
        setIsLoading(true);
        const response = await AdminCrudApi.getUserRanks({ page: 1, size: 100, sort: "min_spent:asc" });
        setRanks(response.data.data);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchRanks();
    }, []);

    function resetForm() {
        setForm(emptyForm);
    }

    function startEdit(item: UserRank) {
        setForm({
            id: item.id,
            name: String(item.name ?? ""),
            min_spent: String(item.min_spent ?? ""),
        });
    }

    async function submitRank() {
        if (!form.name.trim() || !form.min_spent) {
            toast.error("Vui lòng nhập tên hạng và mức chi tiêu tối thiểu.");
            return;
        }

        setIsSaving(true);
        try {
            if (form.id) {
                await AdminCrudApi.updateUserRank(form.id, { name: form.name.trim(), min_spent: Number(form.min_spent) });
                toast.success("Cập nhật hạng người dùng thành công.");
            } else {
                await AdminCrudApi.createUserRank({ name: form.name.trim(), min_spent: Number(form.min_spent) });
                toast.success("Tạo hạng người dùng thành công.");
            }
            resetForm();
            await fetchRanks();
        } catch (error) {
            toast.error(AdminCrudApi.toErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Xếp hạng khách hàng" description="CRUD hạng người dùng theo endpoint `/user-rank/*`" requiredPermissions={["VIEW_USER_RANKS"]}>
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{form.id ? "Cập nhật hạng" : "Tạo hạng"}</CardTitle>
                        <CardDescription>Backend hiện hỗ trợ create/update, chưa có delete</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <Label>Tên hạng</Label>
                            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Min spent</Label>
                            <Input value={form.min_spent} onChange={(e) => setForm((prev) => ({ ...prev, min_spent: e.target.value }))} />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => void submitRank()} disabled={isSaving}>
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
                        <CardTitle>Danh sách hạng</CardTitle>
                        <CardDescription>{ranks.length} bản ghi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tải...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {ranks.map((item) => (
                                    <div key={item.id} className="rounded-md border p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Crown className="h-4 w-4" />
                                                    {String(item.name ?? `Rank #${item.id}`)}
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">min_spent: {String(item.min_spent ?? "-")}</p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {ranks.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu hạng người dùng.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
