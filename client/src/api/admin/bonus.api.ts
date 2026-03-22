import { adminAxiosInstance as axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface BonusItem {
    id: number;
    user_id: number;
    month: number;
    year: number;
    amount: number;
    reason?: string;
    type: string;
    created_by?: number;
    user?: { id: number; full_name: string; email?: string };
    creator?: { id: number; full_name: string };
    created_at?: string;
}

export interface BonusSummaryItem {
    user_id: number;
    total_bonus: number;
}

export const BonusApi = {
    /** Lấy danh sách bonus (filter theo user_id, month, year) */
    getList: async (params: { user_id?: number; month?: number; year?: number }): Promise<ApiResponse<BonusItem[]>> => {
        try {
            const res = await axiosInstance.get("/bonuses", { params });
            return res.data;
        } catch (error) {
            console.warn("[BonusApi] /bonuses [GET] failed", error);
            throw error;
        }
    },

    /** Tạo bonus mới */
    create: async (payload: {
        user_id: number;
        month: number;
        year: number;
        amount: number;
        reason?: string;
        type?: string;
    }): Promise<ApiResponse<BonusItem>> => {
        try {
            const res = await axiosInstance.post("/bonuses", payload);
            return res.data;
        } catch (error) {
            console.warn("[BonusApi] /bonuses [POST] failed", error);
            throw error;
        }
    },

    /** Cập nhật bonus */
    update: async (id: number, payload: { amount: number; reason?: string; type?: string }): Promise<ApiResponse<BonusItem>> => {
        try {
            const res = await axiosInstance.put(`/bonuses/${id}`, payload);
            return res.data;
        } catch (error) {
            console.warn("[BonusApi] /bonuses/{id} [PUT] failed", error);
            throw error;
        }
    },

    /** Xóa bonus */
    delete: async (id: number): Promise<ApiResponse<null>> => {
        try {
            const res = await axiosInstance.delete(`/bonuses/${id}`);
            return res.data;
        } catch (error) {
            console.warn("[BonusApi] /bonuses/{id} [DELETE] failed", error);
            throw error;
        }
    },

    /** Tổng hợp bonus theo tháng */
    getSummary: async (month: number, year: number): Promise<ApiResponse<Record<string, BonusSummaryItem>>> => {
        try {
            const res = await axiosInstance.get("/bonuses/summary", { params: { month, year } });
            return res.data;
        } catch (error) {
            console.warn("[BonusApi] /bonuses/summary failed", error);
            throw error;
        }
    },
};
