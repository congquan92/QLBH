"use client";

import { LeaveApi } from "@/api/admin/leave.api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { LeaveRequest } from "@/types/leave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { LeaveAdminHeader } from "./_components/leave-admin-header";
import { LeaveAdminTable } from "./_components/leave-admin-table";

export default function LeaveRequestsPage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [keywordInput, setKeywordInput] = useState("");
    const [leaveDateInput, setLeaveDateInput] = useState("");
    const [keyword, setKeyword] = useState("");
    const [leaveDate, setLeaveDate] = useState("");

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await LeaveApi.getAll({
                page,
                size: pageSize,
                sort: "leave_date:desc",
                keyword: keyword || undefined,
                leave_date: leaveDate || undefined,
            });
            setLeaves(res.data.data || []);
            setTotalPages(Math.max(1, Number(res.data.totalPages ?? 1)));
            setTotalElements(Number(res.data.totalElements ?? 0));
        } catch (error) {
            console.error("Failed to fetch leaves", error);
        } finally {
            setIsLoading(false);
        }
    }, [keyword, leaveDate, page, pageSize]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    async function handleApprove(id: number) {
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

    const pendingCount = leaves.filter((l) => l.status === "PENDING").length;

    return (
        <div className="space-y-5">
            <LeaveAdminHeader total={totalElements} pending={pendingCount} />

            <div className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-end">
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Tìm kiếm</p>
                    <Input
                        value={keywordInput}
                        onChange={(event) => setKeywordInput(event.target.value)}
                        placeholder="Tìm theo lý do hoặc tên nhân viên"
                    />
                </div>
                <div className="w-full space-y-1 md:w-56">
                    <p className="text-sm font-medium">Ngày nghỉ</p>
                    <Input
                        type="date"
                        value={leaveDateInput}
                        onChange={(event) => setLeaveDateInput(event.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        onClick={() => {
                            setPage(1);
                            setKeyword(keywordInput.trim());
                            setLeaveDate(leaveDateInput);
                        }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setPage(1);
                            setKeywordInput("");
                            setLeaveDateInput("");
                            setKeyword("");
                            setLeaveDate("");
                        }}
                    >
                        Đặt lại
                    </Button>
                </div>
            </div>

            <LeaveAdminTable
                leaves={leaves}
                isLoading={isLoading}
                updatingId={updatingId}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
            />

            <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">
                    Tổng {totalElements} đơn, trang {page}/{totalPages}
                </p>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                        Trước
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={page >= totalPages || isLoading} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
                        Sau
                    </Button>
                </div>
            </div>
        </div>
    );
}
