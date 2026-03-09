"use client";

import { useAdminAuth } from "@/components/feature/admin-auth-provider";
import { LeaveApi } from "@/api/leave.api";
import { AdminCrudApi } from "@/api/admin-crud.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Shift } from "@/types/admin-crud";
import type { LeaveRequest } from "@/types/leave";

type LeaveForm = {
    id?: number;
    leave_date: string;
    shift_id: string;
    reason: string;
};

const emptyForm: LeaveForm = {
    leave_date: "",
    shift_id: "",
    reason: "",
};

export default function LeaveRequestsPage() {
    const { hasPermission } = useAdminAuth();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [form, setForm] = useState<LeaveForm>(emptyForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const canViewAll = hasPermission("VIEW_LEAVE_LIST");
    const canApprove = hasPermission("APPROVE_LEAVE");

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [leavesRes, shiftsRes] = await Promise.all([
                canViewAll ? LeaveApi.getAll({ page: 1, size: 100, sort: "leave_date:desc" }) : LeaveApi.getMyLeaves({ page: 1, size: 100, sort: "leave_date:desc" }),
                AdminCrudApi.getShifts({ sort: "name:asc" }),
            ]);
            setLeaves(leavesRes.data.data || []);
            setShifts(shiftsRes.data.data || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    }, [canViewAll]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    function resetForm() {
        setForm(emptyForm);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.leave_date || !form.shift_id) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        setIsSubmitting(true);
        try {
            await LeaveApi.create({
                leave_date: form.leave_date,
                shift_id: parseInt(form.shift_id),
                reason: form.reason,
            });
            toast.success("Đã gửi đơn nghỉ phép thành công");
            resetForm();
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể tạo đơn nghỉ phép");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleApprove(id: number) {
        if (!canApprove) {
            toast.error("Bạn không có quyền duyệt đơn");
            return;
        }

        setUpdatingId(id);
        try {
            await LeaveApi.updateStatus(id, "APPROVED");
            toast.success("Đã duyệt đơn nghỉ phép");
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể duyệt đơn");
        } finally {
            setUpdatingId(null);
        }
    }

    async function handleReject(id: number) {
        if (!canApprove) {
            toast.error("Bạn không có quyền từ chối đơn");
            return;
        }

        setUpdatingId(id);
        try {
            await LeaveApi.updateStatus(id, "REJECTED");
            toast.success("Đã từ chối đơn nghỉ phép");
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể từ chối đơn");
        } finally {
            setUpdatingId(null);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Xác nhận xóa đơn nghỉ phép này?")) return;

        setUpdatingId(id);
        try {
            await LeaveApi.delete(id);
            toast.success("Đã xóa đơn nghỉ phép");
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể xóa đơn");
        } finally {
            setUpdatingId(null);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            case "APPROVED":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "REJECTED":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PENDING":
                return "Chờ duyệt";
            case "APPROVED":
                return "Đã duyệt";
            case "REJECTED":
                return "Từ chối";
            default:
                return status;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Đơn nghỉ phép</h1>
                    <p className="text-muted-foreground">{canViewAll ? "Quản lý tất cả đơn nghỉ phép" : "Xem đơn nghỉ phép của bạn"}</p>
                </div>
            </div>

            {/* Create Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Gửi đơn nghỉ phép
                    </CardTitle>
                    <CardDescription>Điền thông tin để xin nghỉ phép</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="leave_date">Ngày nghỉ</Label>
                                <Input id="leave_date" type="date" value={form.leave_date} onChange={(e) => setForm({ ...form, leave_date: e.target.value })} required min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shift_id">Ca làm việc</Label>
                                <Select value={form.shift_id} onValueChange={(val) => setForm({ ...form, shift_id: val })} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn ca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shifts.map((shift) => (
                                            <SelectItem key={shift.id} value={String(shift.id)}>
                                                {shift.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reason">Lý do (tuỳ chọn)</Label>
                                <Input id="reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Nhập lý do nghỉ phép..." />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Gửi đơn
                                    </>
                                )}
                            </Button>
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Hủy
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* List */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách đơn nghỉ phép</CardTitle>
                    <CardDescription>{canViewAll ? "Tất cả đơn nghỉ phép trong hệ thống" : "Danh sách đơn nghỉ phép của bạn"}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải...
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted">
                                    <tr>
                                        <th className="px-6 py-3">ID</th>
                                        {canViewAll && <th className="px-6 py-3">Nhân viên</th>}
                                        <th className="px-6 py-3">Ngày nghỉ</th>
                                        <th className="px-6 py-3">Ca làm việc</th>
                                        <th className="px-6 py-3">Lý do</th>
                                        <th className="px-6 py-3">Trạng thái</th>
                                        <th className="px-6 py-3">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.length > 0 ? (
                                        leaves.map((leave) => {
                                            const isUpdating = updatingId === leave.id;
                                            return (
                                                <tr key={leave.id} className="border-b hover:bg-muted/50">
                                                    <td className="px-6 py-4 font-medium">#{leave.id}</td>
                                                    {canViewAll && <td className="px-6 py-4">{String(leave.employee_name || "N/A")}</td>}
                                                    <td className="px-6 py-4">{new Date(leave.leave_date).toLocaleDateString("vi-VN")}</td>
                                                    <td className="px-6 py-4">{String(leave.shift_name || `Shift ${leave.shift_id}`)}</td>
                                                    <td className="px-6 py-4">{leave.reason || "-"}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>{getStatusLabel(leave.status)}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            {canApprove && leave.status === "PENDING" && (
                                                                <>
                                                                    <Button variant="outline" size="sm" onClick={() => handleApprove(leave.id)} disabled={isUpdating}>
                                                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                                                                    </Button>
                                                                    <Button variant="outline" size="sm" onClick={() => handleReject(leave.id)} disabled={isUpdating}>
                                                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 text-red-600" />}
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {leave.status === "PENDING" && (
                                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(leave.id)} disabled={isUpdating}>
                                                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                                </Button>
                                                            )}
                                                            {leave.status !== "PENDING" && <span className="text-xs text-muted-foreground">-</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td className="px-6 py-8 text-center text-muted-foreground" colSpan={canViewAll ? 7 : 6}>
                                                Chưa có đơn nghỉ phép nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
