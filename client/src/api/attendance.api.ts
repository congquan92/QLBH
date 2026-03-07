import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { AttendanceHistory, AttendanceRecord } from "@/types/attendance";

function toErrorMessage(error: unknown): string {
    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    return "Đã xảy ra lỗi";
}

export const AttendanceApi = {
    /**
     * Record attendance (check-in/check-out)
     * POST /attendance/record
     */
    record: async (): Promise<ApiResponse<AttendanceRecord>> => {
        try {
            const res = await axiosInstance.post("/attendance/record");
            return res.data;
        } catch (error) {
            console.warn("[AttendanceApi] /attendance/record failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Get attendance history
     * GET /attendance/my-history
     */
    getHistory: async (params?: { startDate?: string; endDate?: string; page?: number; size?: number; sort?: string }): Promise<ApiResponse<AttendanceHistory>> => {
        try {
            const res = await axiosInstance.get("/attendance/my-history", { params });
            return res.data;
        } catch (error) {
            console.warn("[AttendanceApi] /attendance/my-history failed", error);
            throw new Error(toErrorMessage(error));
        }
    },
};
