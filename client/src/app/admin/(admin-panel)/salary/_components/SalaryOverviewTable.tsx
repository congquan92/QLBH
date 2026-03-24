"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Helper } from "@/lib/helper";
import type { SalaryBulkItem } from "@/types/salary";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
    data: SalaryBulkItem[];
    isLoading: boolean;
    month: number;
    year: number;
};

export function SalaryOverviewTable({ data, isLoading, month, year }: Props) {
    const pageSize = 10;
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [data, month, year]);

    const maxSalary = data.length > 0 ? Math.max(...data.filter((d) => d.status === "ok").map((d) => d.final_salary)) : 0;
    const totalOk = data.filter((d) => d.status === "ok").length;
    const totalError = data.filter((d) => d.status === "error").length;
    const grandTotal = data.reduce((sum, d) => sum + d.final_salary, 0);

    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pagedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [currentPage, data]);

    const startRow = data.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endRow = data.length === 0 ? 0 : Math.min(currentPage * pageSize, data.length);

    return (
        <Card className="mt-6">
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Bảng Lương Tháng {month}/{year}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {isLoading ? "Đang tính..." : `${totalOk} nhân viên có lương · ${totalError} không có dữ liệu · Tổng quỹ lương: ${Helper.formatPrice(String(grandTotal))}`}
                        </CardDescription>
                    </div>
                    {!isLoading && data.length > 0 && (
                        <div className="flex gap-2 text-sm">
                            <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-4 w-4" /> {totalOk}
                            </span>
                            {totalError > 0 && (
                                <span className="flex items-center gap-1 text-destructive">
                                    <AlertCircle className="h-4 w-4" /> {totalError}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted">
                            <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Nhân viên</th>
                                <th className="px-4 py-3">Chức vụ</th>
                                <th className="px-4 py-3">Loại HĐ</th>
                                <th className="px-4 py-3 text-right">Lương cơ bản</th>
                                <th className="px-4 py-3 text-right">Thưởng lễ</th>
                                <th className="px-4 py-3 text-right">Cộng thêm</th>
                                <th className="px-4 py-3 text-right font-bold">Tổng lương</th>
                                <th className="px-4 py-3 text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-6" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                                        <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
                                        <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                                        <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                                        <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-28 ml-auto" /></td>
                                        <td className="px-4 py-3 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td>
                                    </tr>
                                ))
                                : data.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                                                Chưa có dữ liệu. Nhấn &quot;Tính lương&quot; để xem kết quả.
                                            </td>
                                        </tr>
                                    )
                                    : pagedData.map((item, idx) => {
                                        const isTop = item.status === "ok" && item.final_salary === maxSalary && maxSalary > 0;
                                        return (
                                            <tr
                                                key={item.user_id}
                                                className={`border-b transition-colors ${item.status === "error"
                                                    ? "bg-red-50/50 hover:bg-red-50"
                                                    : isTop
                                                        ? "bg-amber-50/60 hover:bg-amber-50"
                                                        : "hover:bg-muted/40"
                                                    }`}
                                            >
                                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{(currentPage - 1) * pageSize + idx + 1}</td>
                                                <td className="px-4 py-3 font-medium">
                                                    {item.employee}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{item.position}</td>
                                                <td className="px-4 py-3">
                                                    {item.employment_type ? (
                                                        <Badge variant="outline" className="text-xs">
                                                            {item.employment_type === "FULL_TIME" ? "Full-time" : item.employment_type === "PART_TIME" ? "Part-time" : item.employment_type}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono">
                                                    {item.status === "ok" ? Helper.formatPrice(String(item.base_salary)) : "-"}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-green-600">
                                                    {item.status === "ok" && item.total_holiday_bonus > 0
                                                        ? `+${Helper.formatPrice(String(item.total_holiday_bonus))}`
                                                        : item.status === "ok" ? "0" : "-"}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-amber-600">
                                                    {item.status === "ok" && (item.total_manual_bonus ?? 0) > 0
                                                        ? `+${Helper.formatPrice(String(item.total_manual_bonus))}`
                                                        : item.status === "ok" ? "0" : "-"}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono font-bold">
                                                    {item.status === "ok" ? Helper.formatPrice(String(item.final_salary)) : "-"}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {item.status === "ok" ? (
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Thành công</Badge>
                                                    ) : (
                                                        <Badge
                                                            className="bg-red-100 text-red-700 hover:bg-red-100 cursor-help"
                                                            title={item.error ?? "Lỗi không xác định"}
                                                        >
                                                            Thiếu dữ liệu
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                        </tbody>
                        {!isLoading && data.length > 0 && (
                            <tfoot>
                                <tr className="border-t-2 bg-muted/30 font-semibold">
                                    <td colSpan={7} className="px-4 py-3 text-right text-sm">
                                        Tổng quỹ lương:
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-primary">
                                        {Helper.formatPrice(String(grandTotal))}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {!isLoading && data.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                        <span>
                            Hiển thị {startRow}-{endRow} / {data.length} nhân viên
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage <= 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Trước
                            </Button>
                            <span>
                                Trang {currentPage}/{totalPages}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage >= totalPages}
                            >
                                Sau
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
