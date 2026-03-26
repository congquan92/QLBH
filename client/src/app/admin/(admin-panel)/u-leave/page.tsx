"use client";

import { LeaveApi } from "@/api/admin/leave.api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Shift } from "@/types/admin-crud";
import type { LeaveRequest } from "@/types/leave";

import { LeaveHeader } from "./_components/leave-header";
import { LeaveList } from "./_components/leave-list";

type LeaveForm = {
    leave_date: string;
    shift_id: string;
    reason: string;
};

export default function UserLeavePage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingShifts, setIsLoadingShifts] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const leavesRes = await LeaveApi.getMyLeaves({ page: 1, size: 100, sort: "leave_date:desc" });
            setLeaves(leavesRes.data.data || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

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
            <LeaveList leaves={leaves} isLoading={isLoading} />
        </div>
    );
}
