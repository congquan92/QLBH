"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Trash2, FileText, Clock } from "lucide-react";
import type { LeaveRequest } from "@/types/leave";

type Props = {
    leaves: LeaveRequest[];
    isLoading: boolean;
    updatingId: number | null;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onDelete: (id: number) => void;
};

const getLeaveTypeLabel = (leaveType?: string) => {
    switch (leaveType) {
        case "SICK_MATERNITY":
            return "Ốm đau / thai sản";
        case "RESIGNATION":
            return "Nghỉ việc";
        case "ANNUAL":
        default:
            return "Nghỉ phép";
    }
};

const formatDateRange = (startDate?: string, endDate?: string, fallbackDate?: string) => {
    const start = startDate || fallbackDate;
    const end = endDate || start;

    if (!start) return "-";
    const startText = new Date(start).toLocaleDateString("vi-VN");
    const endText = new Date(end as string).toLocaleDateString("vi-VN");

    if (startText === endText) return startText;
    return `${startText} - ${endText}`;
};

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
        case "PENDING": return "Chờ duyệt";
        case "APPROVED": return "Đã duyệt";
        case "REJECTED": return "Từ chối";
        default: return status;
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "PENDING": return <Clock className="h-3 w-3" />;
        case "APPROVED": return <CheckCircle className="h-3 w-3" />;
        case "REJECTED": return <XCircle className="h-3 w-3" />;
        default: return null;
    }
};

export function LeaveAdminTable({ leaves, isLoading, updatingId, onApprove, onReject, onDelete }: Props) {
    return (
        <Card>
            <CardHeader >
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Danh sách đơn nghỉ phép
                </CardTitle>
                <CardDescription>Xem và duyệt tất cả đơn nghỉ phép trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16 text-muted-foreground">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang tải...
                    </div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/60 border-y">
                                <tr>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground">ID</th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground">Nhân viên</th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground">Loại nghỉ</th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground">Khoảng nghỉ</th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground">Ca làm việc</th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground">Lý do</th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground">Ngày gửi</th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground">Trạng thái</th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {leaves.length > 0 ? (
                                    leaves.map((leave) => {
                                        const isUpdating = updatingId === leave.id;
                                        const isPending = leave.status === "PENDING";

                                        return (
                                            <tr
                                                key={leave.id}
                                                className="hover:bg-muted/40 transition-colors group"
                                            >
                                                <td className="px-5 py-3.5 font-medium text-muted-foreground">
                                                    #{leave.id}
                                                </td>
                                                <td className="px-5 py-3.5 font-medium">
                                                    {String(leave.user_name ?? leave.employee_name ?? "N/A")}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {getLeaveTypeLabel(leave.leave_type)}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {formatDateRange(leave.start_date, leave.end_date, leave.leave_date)}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {leave.shift?.name ?? leave.shift_name ?? "-"}
                                                </td>
                                                <td className="px-5 py-3.5 text-muted-foreground max-w-45 truncate">
                                                    {leave.reason || <span className="italic text-muted-foreground/50">—</span>}
                                                </td>
                                                <td className="px-5 py-3.5 text-muted-foreground">
                                                    {leave.created_at
                                                        ? new Date(leave.created_at).toLocaleDateString("vi-VN")
                                                        : "—"}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}
                                                    >
                                                        {getStatusIcon(leave.status)}
                                                        {getStatusLabel(leave.status)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {isPending ? (
                                                            <>
                                                                {/* Duyệt */}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 px-3 border-green-200 hover:bg-green-50 hover:border-green-400 dark:border-green-800 dark:hover:bg-green-900/30 transition-colors"
                                                                    onClick={() => onApprove(leave.id)}
                                                                    disabled={isUpdating}
                                                                    title="Duyệt đơn"
                                                                >
                                                                    {isUpdating ? (
                                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                                                            <span className="ml-1 text-xs text-green-700 dark:text-green-400">Duyệt</span>
                                                                        </>
                                                                    )}
                                                                </Button>

                                                                {/* Từ chối */}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 px-3 border-red-200 hover:bg-red-50 hover:border-red-400 dark:border-red-800 dark:hover:bg-red-900/30 transition-colors"
                                                                    onClick={() => onReject(leave.id)}
                                                                    disabled={isUpdating}
                                                                    title="Từ chối"
                                                                >
                                                                    {isUpdating ? (
                                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <XCircle className="h-3.5 w-3.5 text-red-600" />
                                                                            <span className="ml-1 text-xs text-red-700 dark:text-red-400">Từ chối</span>
                                                                        </>
                                                                    )}
                                                                </Button>

                                                                {/* Xóa */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                                    onClick={() => onDelete(leave.id)}
                                                                    disabled={isUpdating}
                                                                    title="Xóa đơn"
                                                                >
                                                                    {isUpdating ? (
                                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    )}
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground/50 italic">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td className="px-5 py-16 text-center text-muted-foreground" colSpan={9}>
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="h-10 w-10 text-muted-foreground/20" />
                                                <span>Chưa có đơn nghỉ phép nào</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
