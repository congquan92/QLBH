import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { ActiveUserStats, CategoryStats, MonthlyRevenue, OrderStats, TopProduct } from "@/types/statistics";

export const StatisticsApi = {
    getActiveUsers: async (period: number = 1): Promise<ApiResponse<ActiveUserStats>> => {
        try {
            const res = await axiosInstance.get("/statistical/users", { params: { period } });
            return res.data;
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/users failed", error);
            throw error;
        }
    },

    getOrders: async (period: number = 1): Promise<ApiResponse<OrderStats>> => {
        try {
            const res = await axiosInstance.get("/statistical/orders", { params: { period } });
            return res.data;
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/orders failed", error);
            throw error;
        }
    },

    getRevenue12Months: async (): Promise<ApiResponse<MonthlyRevenue[]>> => {
        try {
            const res = await axiosInstance.get("/statistical/revenue-12months");
            return res.data;
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/revenue-12months failed", error);
            throw error;
        }
    },

    getTopProducts: async (period: number = 1, top: number = 5): Promise<ApiResponse<TopProduct[]>> => {
        try {
            const res = await axiosInstance.get("/statistical/top-products", { params: { period, top } });
            return res.data;
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/top-products failed", error);
            throw error;
        }
    },

    getCategories: async (period: number = 1): Promise<ApiResponse<CategoryStats[]>> => {
        try {
            const res = await axiosInstance.get("/statistical/categories", { params: { period } });
            return res.data;
        } catch (error) {
            console.warn("[StatisticsApi] /statistical/categories failed", error);
            throw error;
        }
    },
};
