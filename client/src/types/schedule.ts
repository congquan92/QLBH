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

export type WeeklyReportResponse = ApiResponse<WeeklyReport>;
export type DailyStaffResponse = ApiResponse<DailyStaff>;
export type MyScheduleResponse = ApiResponse<MySchedule>;
