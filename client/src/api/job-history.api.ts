import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface JobHistoryRecord {
    id: number;
    user_id: number;
    old_position_id?: number;
    new_position_id: number;
    old_position_name?: string;
    new_position_name: string;
    promotion_date: string;
    reason?: string;
    created_at?: string;
    [key: string]: unknown;
}

export interface CareerPath {
    user_id: number;
    full_name: string;
    current_position: string;
    history: JobHistoryRecord[];
}

function toErrorMessage(error: unknown): string {
    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    return "Đã xảy ra lỗi";
}

export const JobHistoryApi = {
    /**
     * Promote employee
     * POST /job-history/promote/{userId}
     */
    promote: async (
        userId: number,
        payload: {
            new_position_id: number;
            promotion_date: string;
            reason?: string;
        },
    ): Promise<ApiResponse<JobHistoryRecord>> => {
        try {
            const res = await axiosInstance.post(`/job-history/promote/${userId}`, payload);
            return res.data;
        } catch (error) {
            console.warn("[JobHistoryApi] /job-history/promote/{userId} failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Get career path by user ID (Admin)
     * GET /job-history/career/{id}
     */
    getCareerById: async (userId: number): Promise<ApiResponse<CareerPath>> => {
        try {
            const res = await axiosInstance.get(`/job-history/career/${userId}`);
            return res.data;
        } catch (error) {
            console.warn("[JobHistoryApi] /job-history/career/{id} failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Get my career path
     * GET /job-history/my-career
     */
    getMyCareer: async (): Promise<ApiResponse<CareerPath>> => {
        try {
            const res = await axiosInstance.get("/job-history/my-career");
            return res.data;
        } catch (error) {
            console.warn("[JobHistoryApi] /job-history/my-career failed", error);
            throw new Error(toErrorMessage(error));
        }
    },
};
