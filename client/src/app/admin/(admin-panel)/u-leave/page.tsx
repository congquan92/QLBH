"use client";

import { LeaveApi } from "@/api/admin/leave.api";
import { AdminCrudApi } from "@/api/admin/admin-crud.api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Shift } from "@/types/admin-crud";
import type { LeaveRequest } from "@/types/leave";

import { LeaveHeader } from "./_components/leave-header";
import { LeaveRequestForm } from "./_components/leave-form";
import { LeaveList } from "./_components/leave-list";

type LeaveForm = {
    leave_date: string;
    shift_id: string;
    reason: string;
};

const emptyForm: LeaveForm = {
    leave_date: "",
    shift_id: "",
    reason: "",
};

export default function UserLeavePage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [form, setForm] = useState<LeaveForm>(emptyForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [leavesRes, shiftsRes] = await Promise.all([
                LeaveApi.getMyLeaves({ page: 1, size: 100, sort: "leave_date:desc" }),
                AdminCrudApi.getShifts({ sort: "name:asc" }),
            ]);
            setLeaves(leavesRes.data.data || []);
            setShifts(shiftsRes.data.data || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

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

    return (
        <div className="space-y-5">
            {/* Header */}
            <LeaveHeader />

            {/* Create Form */}
            <LeaveRequestForm
                form={form}
                shifts={shifts}
                isSubmitting={isSubmitting}
                onFormChange={setForm}
                onSubmit={handleSubmit}
                onReset={resetForm}
            />

            {/* List */}
            <LeaveList leaves={leaves} isLoading={isLoading} />
        </div>
    );
}
