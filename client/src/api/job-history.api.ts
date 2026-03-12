import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { CareerPath, JobHistoryRecord } from "@/types/job-history";

export const JobHistoryApi = {
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
            throw error;
        }
    },

    getCareerById: async (userId: number): Promise<ApiResponse<CareerPath>> => {
        try {
            const res = await axiosInstance.get(`/job-history/career/${userId}`);
            return res.data;
        } catch (error) {
            console.warn("[JobHistoryApi] /job-history/career/{id} failed", error);
            throw error;
        }
    },

    getMyCareer: async (): Promise<ApiResponse<CareerPath>> => {
        try {
            const res = await axiosInstance.get("/job-history/my-career");
            return res.data;
        } catch (error) {
            console.warn("[JobHistoryApi] /job-history/my-career failed", error);
            throw error;
        }
    },
};
