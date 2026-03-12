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

export type SalaryCalculationResponse = ApiResponse<SalaryCalculation>;
