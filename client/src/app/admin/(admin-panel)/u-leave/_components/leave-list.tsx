"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, FileText } from "lucide-react";
import type { LeaveRequest } from "@/types/leave";

type Props = {
    leaves: LeaveRequest[];
    isLoading: boolean;
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

const getStatusIcon = (status: string) => {
    switch (status) {
        case "PENDING":
            return <Clock className="h-3.5 w-3.5" />;
        case "APPROVED":
            return <span className="text-green-600">✓</span>;
        case "REJECTED":
            return <span className="text-red-600">✗</span>;
        default:
            return null;
    }
};

export function LeaveList({ leaves, isLoading }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Đơn nghỉ phép của tôi
                </CardTitle>
                <CardDescription>Danh sách đơn nghỉ phép bạn đã gửi</CardDescription>
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
                                    <th className="px-6 py-3">Loại nghỉ</th>
                                    <th className="px-6 py-3">Khoảng nghỉ</th>
                                    <th className="px-6 py-3">Ca làm việc</th>
                                    <th className="px-6 py-3">Lý do</th>
                                    <th className="px-6 py-3">Ngày gửi</th>
                                    <th className="px-6 py-3">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.length > 0 ? (
                                    leaves.map((leave) => (
                                        <tr key={leave.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">#{leave.id}</td>
                                            <td className="px-6 py-4">
                                                {getLeaveTypeLabel(leave.leave_type)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {formatDateRange(leave.start_date, leave.end_date, leave.leave_date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {leave.shift?.name ?? leave.shift_name ?? "-"}
                                            </td>
                                            <td className="px-6 py-4">{leave.reason || "-"}</td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {leave.created_at
                                                    ? new Date(leave.created_at).toLocaleDateString("vi-VN")
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}
                                                >
                                                    {getStatusIcon(leave.status)}
                                                    {getStatusLabel(leave.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-6 py-8 text-center text-muted-foreground" colSpan={7}>
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="h-8 w-8 text-muted-foreground/30" />
                                                <span>Bạn chưa gửi đơn nghỉ phép nào</span>
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
