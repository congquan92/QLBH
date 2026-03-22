import type { ApiResponse } from "@/types/api";

export interface SalaryCalculation {
    user_id: number;
    employee: string;
    month: string;
    position: string;
    employment_type: string;
    base_salary: number;
    total_holiday_bonus: number;
    total_manual_bonus: number;
    final_salary: number;
    bonus_details: Array<{
        name?: string;
        amount?: number;
        [key: string]: unknown;
    }>;
    manual_bonus_details?: Array<{
        id: number;
        amount: number;
        reason?: string;
        type: string;
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
    total_manual_bonus: number;
    final_salary: number;
    bonus_details: Array<{ date: string; hours: number; bonus: number }>;
    manual_bonus_details?: Array<{ id: number; amount: number; reason?: string; type: string }>;
    status: "ok" | "error";
    error: string | null;
}

export type SalaryCalculationResponse = ApiResponse<SalaryCalculation>;
export type SalaryBulkResponse = ApiResponse<SalaryBulkItem[]>;
