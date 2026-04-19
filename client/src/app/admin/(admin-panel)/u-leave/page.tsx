"use client";

import { LeaveApi } from "@/api/admin/leave.api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Shift } from "@/types/admin-crud";
import type { LeaveRequest } from "@/types/leave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { LeaveHeader } from "./_components/leave-header";
import { LeaveList } from "./_components/leave-list";

type LeaveForm = {
    leave_type: "ANNUAL" | "SICK_MATERNITY" | "RESIGNATION";
    start_date: string;
    end_date: string;
    shift_id: string;
    reason: string;
};

export default function UserLeavePage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingShifts, setIsLoadingShifts] = useState(false);
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
            const leavesRes = await LeaveApi.getMyLeaves({
                page,
                size: pageSize,
                sort: "leave_date:desc",
                keyword: keyword || undefined,
                leave_date: leaveDate || undefined,
            });
            setLeaves(leavesRes.data.data || []);
            setTotalPages(Math.max(1, Number(leavesRes.data.totalPages ?? 1)));
            setTotalElements(Number(leavesRes.data.totalElements ?? 0));
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    }, [leaveDate, keyword, page, pageSize]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    async function handleLeaveDateChange(leaveDate: string) {
        if (!leaveDate) {
            setShifts([]);
            return;
        }

        setIsLoadingShifts(true);
        try {
            const response = await LeaveApi.getAvailableShifts(leaveDate);
            setShifts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setShifts([]);
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                "Không thể tải ca làm việc theo ngày đã chọn";
            toast.error(message);
        } finally {
            setIsLoadingShifts(false);
        }
    }

    async function handleSubmit(form: LeaveForm) {
        const isResignation = form.leave_type === "RESIGNATION";
        const isSingleDay = Boolean(form.start_date) && Boolean(form.end_date) && form.start_date === form.end_date;

        if ((!isResignation && (!form.start_date || !form.end_date)) || (!isResignation && isSingleDay && !form.shift_id)) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        const fallbackDate = new Date(Date.now() + 86400000).toISOString().split("T")[0];
        const startDate = form.start_date || fallbackDate;
        const endDate = form.end_date || startDate;

        setIsSubmitting(true);
        try {
            await LeaveApi.create({
                leave_type: form.leave_type,
                start_date: startDate,
                end_date: endDate,
                leave_date: startDate,
                shift_id: isResignation || !isSingleDay ? undefined : parseInt(form.shift_id),
                reason: form.reason,
            });
            toast.success("Đã gửi đơn nghỉ phép thành công");
            setPage(1);
            await fetchData();
        } catch (error) {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                (error instanceof Error ? error.message : "Không thể tạo đơn nghỉ phép");
            toast.error(message);
            throw error; // để dialog không tự đóng khi lỗi
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-5">
            <LeaveHeader
                shifts={shifts}
                isSubmitting={isSubmitting}
                isLoadingShifts={isLoadingShifts}
                onLeaveDateChange={handleLeaveDateChange}
                onSubmit={handleSubmit}
            />

            <div className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-end">
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Tìm kiếm</p>
                    <Input
                        value={keywordInput}
                        onChange={(event) => setKeywordInput(event.target.value)}
                        placeholder="Nhập lý do nghỉ phép"
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

            <LeaveList leaves={leaves} isLoading={isLoading} />

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
