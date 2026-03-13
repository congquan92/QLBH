"use client";

import { AdminCrudApi } from "@/api/admin-crud.api";
import { AdminPageShell } from "@/components/feature/admin-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserRank } from "@/types/admin-crud";
import { Helper } from "@/lib/helper";

type UserRankForm = {
    id?: number;
    name: string;
    min_spent: string;
    status?: string;
};

const emptyForm: UserRankForm = {
    name: "",
    min_spent: "",
};

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "ACTIVE", className: "text-green-700" },
    { value: "INACTIVE", label: "INACTIVE", className: "text-yellow-600" },
];

export default function UserRanksPage() {
    const [ranks, setRanks] = useState<UserRank[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<UserRankForm>(emptyForm);

    async function fetchRanks() {
        setIsLoading(true);
        const response = await AdminCrudApi.getUserRanks({ page: 1, size: 10, sort: "min_spent:asc" });
        console.log("Fetched ranks:", response.data.data);
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
            min_spent: String(item.minSpent ?? ""),
            status: String(item.status ?? "ACTIVE"),
        });
    }

    async function disableRank(item: UserRank) {
        if (!confirm(`Xóa hạng "${String(item.name)}"? Hành động này xóa hạng khỏi hệ thống.`)) return;
        try {
            await AdminCrudApi.updateUserRank(item.id, { name: item.name, min_spent: Number(item.minSpent), status: "DISABLED" });
            toast.success(`Đã vô hiệu hóa hạng "${String(item.name)}".`);
            await fetchRanks();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        }
    }

    async function submitRank() {
        if (!form.name.trim() || !form.min_spent) {
            toast.error("Vui lòng nhập tên hạng và mức chi tiêu tối thiểu.");
            return;
        }

        setIsSaving(true);
        try {
            if (form.id) {
                await AdminCrudApi.updateUserRank(form.id, { name: form.name.trim(), min_spent: Number(form.min_spent), status: form.status ?? "ACTIVE" });
                toast.success("Cập nhật hạng người dùng thành công.");
            } else {
                await AdminCrudApi.createUserRank({ name: form.name.trim(), minSpent: Number(form.min_spent) });
                toast.success("Tạo hạng người dùng thành công.");
            }
            resetForm();
            await fetchRanks();
        } catch (error) {
            toast.error(Helper.errorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AdminPageShell title="Xếp hạng khách hàng" description="Quản lý các hạng thành viên và mức chi tiêu tương ứng" requiredPermissions={["VIEW_USER_RANKS"]}>
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Form */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">{form.id ? "Cập nhật hạng" : "Tạo hạng mới"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Tên hạng</Label>
                            <Input placeholder="VD: DIAMOND" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        {form.id && (
                            <div className="space-y-1.5">
                                <Label>Trạng thái</Label>
                                <Select value={form.status ?? "ACTIVE"} onValueChange={(val) => setForm((prev) => ({ ...prev, status: val }))}>
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
                        <div className="space-y-1.5">
                            <Label>Mức chi tiêu tối thiểu (VND)</Label>
                            <Input type="number" min={0} placeholder="VD: 10000000" value={form.min_spent} onChange={(e) => setForm((prev) => ({ ...prev, min_spent: e.target.value }))} />
                            {form.min_spent && !isNaN(Number(form.min_spent)) && <p className="text-xs text-muted-foreground">{Helper.formatCurrency(form.min_spent)}</p>}
                        </div>
                        <div className="flex gap-2 pt-1">
                            <Button className="flex-1" onClick={() => void submitRank()} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                {form.id ? "Lưu thay đổi" : "Tạo hạng"}
                            </Button>
                            {form.id && (
                                <Button variant="outline" onClick={resetForm}>
                                    Hủy
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* List */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Danh sách hạng</CardTitle>
                        <CardDescription>{ranks.length} hạng thành viên</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang tải...
                            </div>
                        ) : ranks.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Không có dữ liệu hạng người dùng.</p>
                        ) : (
                            <div className="space-y-3">
                                {ranks.map((item) => {
                                    return (
                                        <div key={item.id} className={`rounded-lg border-2 p-4 transition-colors`}>
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`rounded-full p-2  border`}>
                                                        <Crown className={`h-5 w-5`} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold tracking-wide">{String(item.name ?? `Rank #${item.id}`)}</span>
                                                            <Badge variant="outline" className={`text-xs font-medium ${item.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-300" : "bg-red-50 text-red-600 border-red-300"}`}>
                                                                {String(item.status ?? "ACTIVE")}
                                                            </Badge>
                                                        </div>
                                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                                            Chi tiêu tối thiểu: <span className="font-medium text-foreground">{Helper.formatCurrency(item.minSpent)}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:border-red-300" onClick={() => void disableRank(item)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
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
