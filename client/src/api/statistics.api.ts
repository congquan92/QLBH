import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { ActiveUserStats, CategoryStats, MonthlyRevenue, OrderStats, TopProduct } from "@/types/statistics";

function toErrorMessage(error: unknown): string {
    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    return "Đã xảy ra lỗi";
}

export const StatisticsApi = {
    /**
     * Get active user statistics
     * GET /statistical/users?period=1
     * period: 1=last 7 days, 2=last 30 days, 3=last 90 days
     */
    getActiveUsers: async (period: number = 1): Promise<ApiResponse<ActiveUserStats>> => {
        try {
            const res = await axiosInstance.get("/statistical/users", { params: { period } });
            return res.data;
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/users failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Get order statistics
     * GET /statistical/orders?period=1
     */
    getOrders: async (period: number = 1): Promise<ApiResponse<OrderStats>> => {
        try {
            const res = await axiosInstance.get("/statistical/orders", { params: { period } });
            return res.data;
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/orders failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Get 12-month revenue/cost/profit
     * GET /statistical/revenue-12months
     */
    getRevenue12Months: async (): Promise<ApiResponse<MonthlyRevenue[]>> => {
        try {
            const res = await axiosInstance.get("/statistical/revenue-12months");
            return res.data;
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/revenue-12months failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Get top products
     * GET /statistical/top-products?period=1&top=5
     */
    getTopProducts: async (period: number = 1, top: number = 5): Promise<ApiResponse<TopProduct[]>> => {
        try {
            const res = await axiosInstance.get("/statistical/top-products", { params: { period, top } });
            return res.data;
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/top-products failed", error);
            throw new Error(toErrorMessage(error));
        }
    },

    /**
     * Get category statistics
     * GET /statistical/categories?period=1
     */
    getCategories: async (period: number = 1): Promise<ApiResponse<CategoryStats[]>> => {
        try {
            const res = await axiosInstance.get("/statistical/categories", { params: { period } });
            return res.data;
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/categories failed", error);
            throw new Error(toErrorMessage(error));
        }
    },
};
