import type { ApiResponse } from "@/types/api";

export interface SalaryCalculation {
    user_id: number;
    full_name: string;
    position: string;
    month: number;
    year: number;
    base_salary: number;
    total_hours: number;
    total_days_worked: number;
    overtime_hours: number;
    late_deductions: number;
    bonus: number;
    total_salary: number;
    details: Array<{
        date: string;
        hours_worked: number;
        status: string;
        amount: number;
    }>;
    [key: string]: unknown;
}

/** Response từ server cho từng nhân viên trong bulk calculate */
export interface SalaryBulkItem {
    user_id: number;
    employee: string;
    month: string;
    position: string;
    employment_type: string | null;
    base_salary: number;
    total_holiday_bonus: number;
    final_salary: number;
    bonus_details: Array<{ date: string; hours: number; bonus: number }>;
    status: "ok" | "error";
    error: string | null;
}

export type SalaryCalculationResponse = ApiResponse<SalaryCalculation>;
export type SalaryBulkResponse = ApiResponse<SalaryBulkItem[]>;
