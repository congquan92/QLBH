import { adminAxiosInstance as axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { CreateLeavePayload, LeaveRequest } from "@/types/leave";
import type { Shift } from "@/types/admin-crud";

export const LeaveApi = {
    getAll: async (params?: { keyword?: string; status?: string; leave_date?: string; sort?: string; page?: number; size?: number }): Promise<ApiResponse<PageResponse<LeaveRequest>>> => {
        try {
            const res = await axiosInstance.get("/leave-requests/list", { params });
            return res.data;
        } catch (error) {
            console.warn("[LeaveApi] /leave-requests/list failed", error);
            throw error;
        }
    },

    getMyLeaves: async (params?: { keyword?: string; status?: string; leave_date?: string; sort?: string; page?: number; size?: number }): Promise<ApiResponse<PageResponse<LeaveRequest>>> => {
        try {
            const res = await axiosInstance.get("/leave-requests/me", { params });
            return res.data;
        } catch (error) {
            console.warn("[LeaveApi] /leave-requests/me failed", error);
            throw error;
        }
    },

    create: async (payload: CreateLeavePayload): Promise<ApiResponse<LeaveRequest>> => {
        try {
            const res = await axiosInstance.post("/leave-requests/", payload);
            return res.data;
        } catch (error) {
            console.warn("[LeaveApi] /leave-requests/ failed", error);
            throw error;
        }
    },

    getAvailableShifts: async (leave_date: string): Promise<ApiResponse<Shift[]>> => {
        try {
            const res = await axiosInstance.get("/leave-requests/available-shifts", {
                params: { leave_date },
            });
            return res.data;
        } catch (error) {
            console.warn("[LeaveApi] /leave-requests/available-shifts failed", error);
            throw error;
        }
    },

    updateStatus: async (id: number, status: "APPROVED" | "REJECTED"): Promise<ApiResponse<LeaveRequest>> => {
        try {
            const res = await axiosInstance.post(`/leave-requests/${id}/status`, { status });
            return res.data;
        } catch (error) {
            console.warn("[LeaveApi] /leave-requests/{id}/status failed", error);
            throw error;
        }
    },

    delete: async (id: number): Promise<ApiResponse<null>> => {
        try {
            const res = await axiosInstance.delete(`/leave-requests/${id}`);
            return res.data;
        } catch (error) {
            console.warn("[LeaveApi] /leave-requests/{id} failed", error);
            throw error;
        }
    },
};
