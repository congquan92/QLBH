import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface ScheduleAssignment {
    id: number;
    user_id: number;
    shift_id: number;
    date: string;
    user_name?: string;
    shift_name?: string;
    [key: string]: unknown;
}

export interface DailyStaff {
    date: string;
    shifts: Array<{
        shift_id: number;
        shift_name: string;
        employees: Array<{
            id: number;
            full_name: string;
            position: string;
        }>;
    }>;
}

export interface WeeklyReport {
    week_start: string;
    week_end: string;
    days: Array<{
        date: string;
        day_name: string;
        total_employees: number;
        shifts: Array<{
            shift_name: string;
            count: number;
            employees: string[];
        }>;
    }>;
}

export interface MySchedule {
    employee: string;
    position: string;
    week_start: string;
    schedule: Array<{
        date: string;
        day_name: string;
        shift_name: string;
        start_time: string;
        end_time: string;
    }>;
}

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
};
