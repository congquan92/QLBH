import type { ApiResponse, PageResponse } from "@/types/api";

export interface LeaveRequest {
    id: number;
    leave_date: string;
    shift_id: number;
    shift_name?: string;
    reason?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    employee_name?: string;
    employee_id?: number;
    created_at?: string;
    [key: string]: unknown;
}

export interface CreateLeavePayload {
    leave_date: string;
    shift_id: number;
    reason?: string;
}

export type LeaveListResponse = ApiResponse<PageResponse<LeaveRequest>>;
