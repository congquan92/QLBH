import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { DailyStaff, MySchedule, WeeklyReport } from "@/types/schedule";

function toErrorMessage(error: unknown): string {
    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    return "Đã xảy ra lỗi";
}

export const ScheduleApi = {
    /**
     * Get weekly attendance report
     * GET /schedules/weekly-report?date=YYYY-MM-DD
     */
    getWeeklyReport: async (date?: string): Promise<ApiResponse<WeeklyReport>> => {
        try {
            const res = await axiosInstance.get("/schedules/weekly-report", {
                params: { date: date || new Date().toISOString().split("T")[0] },
            });
            return res.data;
        } catch (error) {
            console.warn("[ScheduleApi] /schedules/weekly-report failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Get daily staff schedule
     * GET /schedules/daily?date=YYYY-MM-DD
     */
    getDailyStaff: async (date?: string): Promise<ApiResponse<DailyStaff>> => {
        try {
            const res = await axiosInstance.get("/schedules/daily", {
                params: { date: date || new Date().toISOString().split("T")[0] },
            });
            return res.data;
        } catch (error) {
            console.warn("[ScheduleApi] /schedules/daily failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Get my schedule
     * GET /schedules/my-schedule?date=YYYY-MM-DD
     */
    getMySchedule: async (date?: string): Promise<ApiResponse<MySchedule>> => {
        try {
            const res = await axiosInstance.get("/schedules/my-schedule", {
                params: { date: date || new Date().toISOString().split("T")[0] },
            });
            return res.data;
        } catch (error) {
            console.warn("[ScheduleApi] /schedules/my-schedule failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Get position default schedule
     * GET /schedules/positions/{positionId}
     */
    getPositionSchedule: async (positionId: number): Promise<ApiResponse<unknown>> => {
        try {
            const res = await axiosInstance.get(`/schedules/positions/${positionId}`);
            return res.data;
        } catch (error) {
            console.warn("[ScheduleApi] /schedules/positions/{id} failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /** GET /schedules/weekly/{userId} — Get weekly schedule for a specific employee */
    getWeeklyEmployee: async (userId: number, date?: string): Promise<ApiResponse<unknown>> => {
        try {
            const res = await axiosInstance.get(`/schedules/weekly/${userId}`, {
                params: { date: date || new Date().toISOString().split("T")[0] },
            });
            return res.data;
        } catch (error) {
            console.warn("[ScheduleApi] /schedules/weekly/{userId} failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /** POST /schedules/positions/{positionId}/default — Set default schedule for a position */
    setPositionDefaultSchedule: async (positionId: number, payload: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
        try {
            const res = await axiosInstance.post(`/schedules/positions/${positionId}/default`, payload);
            return res.data;
        } catch (error) {
            console.warn("[ScheduleApi] /schedules/positions/{id}/default failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /** POST /schedules/assignments — Create schedule assignment */
    createAssignment: async (payload: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
        try {
            const res = await axiosInstance.post("/schedules/assignments", payload);
            return res.data;
        } catch (error) {
            console.warn("[ScheduleApi] /schedules/assignments [POST] failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /** PUT /schedules/{id} — Update schedule assignment */
    updateAssignment: async (id: number, payload: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
        try {
            const res = await axiosInstance.put(`/schedules/${id}`, payload);
            return res.data;
        } catch (error) {
            console.warn("[ScheduleApi] /schedules/{id} [PUT] failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /** DELETE /schedules/assignments — Delete schedule assignment(s) */
    deleteAssignment: async (payload: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
        try {
            const res = await axiosInstance.delete("/schedules/assignments", { data: payload });
            return res.data;
        } catch (error) {
            console.warn("[ScheduleApi] /schedules/assignments [DELETE] failed", error);
            throw new Error(toErrorMessage(error));
        }
    },
};
