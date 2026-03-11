import type { ApiResponse } from "@/types/api";

export interface ActiveUserStats {
    period: number;
    total_users: number;
    active_users: number;
    new_users: number;
    growth_rate: number;
    [key: string]: unknown;
}

export interface OrderStats {
    period: number;
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    pending_orders: number;
    total_revenue: number;
    average_order_value: number;
    [key: string]: unknown;
}

export interface MonthlyRevenue {
    month: string;
    revenue: number;
    cost: number;
    profit: number;
    [key: string]: unknown;
}

export interface TopProduct {
    product_id: number;
    product_name: string;
    total_sold: number;
    total_revenue: number;
    [key: string]: unknown;
}

export interface CategoryStats {
    category_id: number;
    category_name: string;
    total_products: number;
    total_sold: number;
    total_revenue: number;
    [key: string]: unknown;
}

export type ActiveUserStatsResponse = ApiResponse<ActiveUserStats>;
export type OrderStatsResponse = ApiResponse<OrderStats>;
export type Revenue12MonthsResponse = ApiResponse<MonthlyRevenue[]>;
export type TopProductsResponse = ApiResponse<TopProduct[]>;
export type CategoryStatsResponse = ApiResponse<CategoryStats[]>;
