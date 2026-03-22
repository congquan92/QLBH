import type { ApiResponse, PageResponse } from "@/types/api";

export interface LeaveShift {
    id: number;
    name: string;
    time: string;
}

export interface LeaveRequest {
    id: number;
    leave_date: string;
    shift_id?: number;
    shift_name?: string;      // dùng cho admin list (findAll)
    shift?: LeaveShift;       // dùng cho my-leaves (findMyLeaves)
    reason?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    employee_name?: string;
    employee_id?: number;
    user_id?: number;
    user_name?: string;
    created_at?: string;
    [key: string]: unknown;
}


export interface CreateLeavePayload {
    leave_date: string;
    shift_id: number;
    reason?: string;
}

export type LeaveListResponse = ApiResponse<PageResponse<LeaveRequest>>;
