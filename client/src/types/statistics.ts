import type { ApiResponse } from "@/types/api";

export interface ActiveUserStats {
    period: number;
    current: number;
    previous: number;
    percentChange: number;
}

export interface OrderStats {
    period: number;
    current: number;
    previous: number;
    percentChange: number;
}

export interface MonthlyRevenue {
    month: string;
    revenue: number;
    cost: number;
    profit: number;
}

export interface TopProduct {
    productId: number;
    name: string;
    soldQuantity: number;
    percentChange: number;
    listPrice: string;
    salePrice: string;
    urlCoverImage: string | null;
}

export interface CategoryStats {
    categoryName: string;
    quantity: number;
    previousQuantity: number;
    percentChange: number;
}

export type ActiveUserStatsResponse = ApiResponse<ActiveUserStats>;
export type OrderStatsResponse = ApiResponse<OrderStats>;
export type Revenue12MonthsResponse = ApiResponse<MonthlyRevenue[]>;
export type TopProductsResponse = ApiResponse<TopProduct[]>;
export type CategoryStatsResponse = ApiResponse<CategoryStats[]>;
