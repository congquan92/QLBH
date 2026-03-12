import { axiosInstance } from "@/lib/axios";


export const AttendanceApi = {
    /**
     * Record attendance (check-in/check-out)
     * POST /attendance/record
     */
    record: async () => {
        try {
            const res = await axiosInstance.post("/attendance/record");
            return res.data;
        } catch (error) {
            console.warn("[AttendanceApi] /attendance/record failed", error);
            throw error;
        }
    },

    /**
     * Get attendance history
     * GET /attendance/my-history
     */
    getHistory: async (params?: { startDate?: string; endDate?: string; page?: number; size?: number; sort?: string }) => {
        try {
            const res = await axiosInstance.get("/attendance/my-history", { params });
            return res.data;
        } catch (error) {
            console.warn("[AttendanceApi] /attendance/my-history failed", error);
            throw error;
        }
    },
};
