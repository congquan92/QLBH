import type { ApiResponse, PageResponse } from "@/types/api";

export interface Supplier {
    id: number;
    name?: string;
    phone?: string;
    address?: string;
    ward?: string;
    district?: string;
    province?: string;
    status?: string;
    [key: string]: unknown;
}

export interface Position {
    id: number;
    name?: string;
    base_salary?: number | string;
    salary_type?: string;
    [key: string]: unknown;
}

export interface Shift {
    id: number;
    name?: string;
    start_time?: string;
    end_time?: string;
    grace_period?: number;
    [key: string]: unknown;
}

export interface Holiday {
    id: number;
    name?: string;
    holiday_date?: string;
    [key: string]: unknown;
}

export interface SalaryConfig {
    id: number;
    rule_name?: string;
    employee_type?: string;
    multiplier?: number | string;
    is_holiday?: boolean;
    [key: string]: unknown;
}

export interface SalaryScale {
    id: number;
    name?: string;
    years_of_experience?: number;
    coefficient?: number | string;
    [key: string]: unknown;
}

export interface UserRank {
    id: number;
    name?: string;
    min_spent?: number | string;
    [key: string]: unknown;
}

export interface ImportProduct {
    id: number;
    deliveryStatus?: string;
    supplierName?: string;
    createdAt?: string;
    [key: string]: unknown;
}

export type SupplierListResponse = ApiResponse<PageResponse<Supplier>>;
export type PositionListResponse = ApiResponse<PageResponse<Position>>;
export type ShiftListResponse = ApiResponse<PageResponse<Shift>>;
export type HolidayListResponse = ApiResponse<PageResponse<Holiday>>;
export type SalaryConfigListResponse = ApiResponse<PageResponse<SalaryConfig>>;
export type SalaryScaleListResponse = ApiResponse<PageResponse<SalaryScale>>;
export type UserRankListResponse = ApiResponse<PageResponse<UserRank>>;
export type ImportProductListResponse = ApiResponse<PageResponse<ImportProduct>>;
