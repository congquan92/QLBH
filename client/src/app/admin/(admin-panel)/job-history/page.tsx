"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { JobHistoryApi } from "@/api/admin/job-history.api";
import { UserApi } from "@/api/user.api";
import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Loader2, UserCheck, Briefcase, Calendar } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/types/user";
import type { Position } from "@/types/admin-crud";
import type { CareerPath } from "@/types/job-history";

type PromotionForm = {
    userId: string;
    new_position_id: string;
    promotion_date: string;
    reason: string;
};

const emptyForm: PromotionForm = {
    userId: "",
    new_position_id: "",
    promotion_date: new Date().toISOString().split("T")[0],
    reason: "",
};

export default function JobHistoryPage() {
    const { hasPermission } = useAdminAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [form, setForm] = useState<PromotionForm>(emptyForm);
    const [career, setCareer] = useState<CareerPath | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canPromote = hasPermission("PROMOTE_EMPLOYEE");
    const canViewUsers = hasPermission("VIEW_USERS");

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersRes, positionsRes] = await Promise.all([canViewUsers ? UserApi.getUsers({ page: 1, size: 100 }) : Promise.resolve({ data: { data: [] } }), AdminCrudApi.getPositions({ sort: "name:asc" })]);
            setUsers(usersRes.data.data || []);
            setPositions(positionsRes.data.data || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    }, [canViewUsers]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    async function handleViewCareer() {
        if (!form.userId) {
            toast.error("Vui lòng chọn nhân viên");
            return;
        }

        setIsLoading(true);
        try {
            const res = await JobHistoryApi.getCareerById(Number(form.userId));
            setCareer(res.data);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tải lịch sử công việc");
            setCareer(null);
        } finally {
            setIsLoading(false);
        }
    }

    async function handlePromote(e: React.FormEvent) {
        e.preventDefault();

        if (!form.userId || !form.new_position_id || !form.promotion_date) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        if (!canPromote) {
            toast.error("Bạn không có quyền thăng chức");
            return;
        }

        setIsSubmitting(true);
        try {
            await JobHistoryApi.promote(Number(form.userId), {
                new_position_id: Number(form.new_position_id),
                promotion_date: form.promotion_date,
                reason: form.reason,
            });
            toast.success("Thăng chức thành công!");
            setForm(emptyForm);
            setCareer(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể thăng chức");
        } finally {
            setIsSubmitting(false);
        }
    }

    function resetForm() {
        setForm(emptyForm);
        setCareer(null);
    }

    if (!canViewUsers) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Lịch sử công việc</h1>
                <Card>
                    <CardContent className="flex items-center justify-center py-12 text-muted-foreground">Bạn không có quyền VIEW_USERS để xem lịch sử công việc</CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lịch sử công việc</h1>
                    <p className="text-muted-foreground">Theo dõi thăng chức và lịch sử vị trí nhân sự</p>
                </div>
            </div>

            {/* Promotion Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        {canPromote ? "Thăng chức nhân viên" : "Xem lịch sử công việc"}
                    </CardTitle>
                    <CardDescription>{canPromote ? "Cập nhật vị trí mới cho nhân viên" : "Tra cứu quá trình thăng tiến"}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePromote} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="userId">Nhân viên</Label>
                                <Select value={form.userId} onValueChange={(val) => setForm({ ...form, userId: val })}>
                                    <SelectTrigger id="userId">
                                        <SelectValue placeholder="Chọn nhân viên" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={String(user.id)}>
                                                {user.full_name || user.email} - {user.position?.name || "N/A"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {canPromote && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="new_position_id">Vị trí mới</Label>
                                        <Select value={form.new_position_id} onValueChange={(val) => setForm({ ...form, new_position_id: val })}>
                                            <SelectTrigger id="new_position_id">
                                                <SelectValue placeholder="Chọn vị trí" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {positions.map((pos) => (
                                                    <SelectItem key={pos.id} value={String(pos.id)}>
                                                        {pos.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="promotion_date">Ngày thăng chức</Label>
                                        <Input id="promotion_date" type="date" value={form.promotion_date} onChange={(e) => setForm({ ...form, promotion_date: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reason">Lý do (tuỳ chọn)</Label>
                                        <Input id="reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Nhập lý do thăng chức..." />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handleViewCareer} disabled={isLoading || !form.userId}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang tải...
                                    </>
                                ) : (
                                    <>
                                        <Briefcase className="mr-2 h-4 w-4" />
                                        Xem lịch sử
                                    </>
                                )}
                            </Button>
                            {canPromote && (
                                <>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <UserCheck className="mr-2 h-4 w-4" />
                                                Thăng chức
                                            </>
                                        )}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={resetForm}>
                                        Hủy
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Career Timeline */}
            {career && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Quá trình công tác - {career.full_name}
                        </CardTitle>
                        <CardDescription>
                            Vị trí hiện tại: <span className="font-semibold">{career.current_position}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {career.history && career.history.length > 0 ? (
                            <div className="space-y-4">
                                <div className="relative border-l-2 border-muted pl-6 space-y-6">
                                    {career.history.map((record) => (
                                        <div key={record.id} className="relative">
                                            <div className="absolute -left-8 mt-1 h-4 w-4 rounded-full bg-primary border-2 border-background"></div>
                                            <div className="rounded-lg border p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="font-semibold text-lg flex items-center gap-2">
                                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                                            {record.new_position_name}
                                                        </div>
                                                        {record.old_position_name && <div className="text-sm text-muted-foreground">Từ: {record.old_position_name}</div>}
                                                        {record.reason && <div className="text-sm mt-2">{record.reason}</div>}
                                                    </div>
                                                    <div className="text-right text-sm">
                                                        <div className="font-medium">{new Date(record.promotion_date).toLocaleDateString("vi-VN")}</div>
                                                        <div className="text-xs text-muted-foreground">#{record.id}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">Chưa có lịch sử thăng chức</div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
