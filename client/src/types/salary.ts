import type { ApiResponse } from "@/types/api";

export interface SalaryCalculation {
    user_id: number;
    employee: string;
    month: string;
    position: string;
    employment_type: string;
    base_salary: number;
    total_holiday_bonus: number;
    final_salary: number;
    bonus_details: Array<{
        name?: string;
        amount?: number;
        [key: string]: unknown;
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
