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

// ── My Schedule ────────────────────────────────────────────────────────
export interface MyScheduleShift {
    shift_id: number | null;
    shift_name: string;
    time: string;
    type: string; // "Mặc định" | "Ca đặc biệt" | "Nghỉ"
}

export interface MyScheduleDay {
    date: string;
    day_name: string;
    shifts: MyScheduleShift[];
}

export interface MyScheduleResponse {
    status: string;
    employee: string;
    position: string;
    week_schedule: MyScheduleDay[];
}

// ── Daily Staff ────────────────────────────────────────────────────────
export interface DailyStaffEmployee {
    user_id: number;
    name: string;
    position: string;
    shifts: Array<{
        id: number;
        name: string;
        time: string;
        is_special: boolean;
    }>;
}

export interface DailyStaffResponse {
    message: string;
    data: DailyStaffEmployee[];
}

// ── Weekly Report ──────────────────────────────────────────────────────
export interface WeeklyReportEmployee {
    user_id: number;
    name: string;
    position: string;
    is_special: boolean;
    assignment_type: string;
}

export interface WeeklyReportShift {
    shift_id: number;
    shift_name: string;
    start_time: string;
    end_time: string;
    staff_count: number;
    employees: WeeklyReportEmployee[];
}

export interface WeeklyReportDay {
    date: string;
    day_name: string;
    total_staff_working: number;
    shifts: WeeklyReportShift[];
}

export interface WeeklyReportData {
    week_range: string;
    weekly_schedule: WeeklyReportDay[];
}

export interface WeeklyReportResponse {
    status: string;
    message: string;
    data: WeeklyReportData;
}

// ── Legacy compatibility types ─────────────────────────────────────────
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

export type WeeklyReportApiResponse = ApiResponse<WeeklyReport>;
export type DailyStaffApiResponse = ApiResponse<DailyStaff>;
export type MyScheduleApiResponse = ApiResponse<MySchedule>;
