import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { CreateLeavePayload, LeaveRequest } from "@/types/leave";

function toErrorMessage(error: unknown): string {
    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    return "Đã xảy ra lỗi";
}

function normalizeList(payload: unknown): PageResponse<LeaveRequest> {
    if (payload && typeof payload === "object") {
        const data = payload as Partial<PageResponse<LeaveRequest>>;
        if (Array.isArray(data.data)) {
            return data as PageResponse<LeaveRequest>;
        }
    }
    return { data: [], pageNumber: 1, pageSize: 10, totalElements: 0, totalPages: 0 };
}

export const LeaveApi = {
    /**
     * Get all leave requests (Admin)
     * GET /leave-requests/list
     */
    getAll: async (params?: { keyword?: string; status?: string; sort?: string; page?: number; size?: number }): Promise<ApiResponse<PageResponse<LeaveRequest>>> => {
        try {
            const res = await axiosInstance.get("/leave-requests/list", { params });
            return {
                status: 200,
                message: "Success",
                data: normalizeList(res.data.data || res.data),
            };
        } catch (error) {
            console.warn("[LeaveApi] /leave-requests/list failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Get my leave requests
     * GET /leave-requests/me
     */
    getMyLeaves: async (params?: { keyword?: string; status?: string; sort?: string; page?: number; size?: number }): Promise<ApiResponse<PageResponse<LeaveRequest>>> => {
        try {
            const res = await axiosInstance.get("/leave-requests/me", { params });
            return {
                status: 200,
                message: "Success",
                data: normalizeList(res.data.data || res.data),
            };
        } catch (error) {
            console.warn("[LeaveApi] /leave-requests/me failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Create leave request
     * POST /leave-requests/
     */
    create: async (payload: CreateLeavePayload): Promise<ApiResponse<LeaveRequest>> => {
        try {
            const res = await axiosInstance.post("/leave-requests/", payload);
            return res.data;
        } catch (error) {
            console.warn("[LeaveApi] /leave-requests/ failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Update leave request status (Admin)
     * POST /leave-requests/{id}/status
     */
    updateStatus: async (id: number, status: "APPROVED" | "REJECTED"): Promise<ApiResponse<LeaveRequest>> => {
        try {
            const res = await axiosInstance.post(`/leave-requests/${id}/status`, { status });
            return res.data;
        } catch (error) {
            console.warn("[LeaveApi] /leave-requests/{id}/status failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Delete leave request
     * DELETE /leave-requests/{id}
     */
    delete: async (id: number): Promise<ApiResponse<null>> => {
        try {
            const res = await axiosInstance.delete(`/leave-requests/${id}`);
            return res.data;
        } catch (error) {
            console.warn("[LeaveApi] /leave-requests/{id} failed", error);
            throw new Error(toErrorMessage(error));
        }
    },
};
