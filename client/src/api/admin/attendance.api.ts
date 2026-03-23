import { adminAxiosInstance as axiosInstance } from "@/lib/axios";

function getApiErrorMessage(error: unknown, fallback: string) {
    const responseData = (error as { response?: { data?: { message?: string } } })?.response?.data;
    const message = responseData?.message;
    return typeof message === "string" && message.trim() ? message : fallback;
}

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
            throw new Error(getApiErrorMessage(error, "Không thể điểm danh"));
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
            throw new Error(getApiErrorMessage(error, "Không thể tải lịch sử điểm danh"));
        }
    },
};
