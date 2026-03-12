import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { Category } from "@/types/navbar";

const WARNING_PREFIX = "[WARNING][CategoryApi]";

export const CategoryApi = {
    getPublicCategories: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/category/all", { params: { ...query, page, size } });
            return res.data as ApiResponse<Category>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /category/all failed.`, error);
            throw error;
        }
    },

    getAdminCategories: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/category/list", { params: { ...query, page, size } });
            return res.data as ApiResponse<Category>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /category/list failed.`, error);
            throw error;
        }
    },

    getCategoryDetail: async (categoryId: number) => {
        try {
            const res = await axiosInstance.get(`/category/${categoryId}`);
            return res.data as ApiResponse<Category>;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /category/{id} failed.`, error);
            throw error;
        }
    },

    addCategory: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.post("/category/add", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/add failed.`, error);
            throw error;
        }
    },

    updateCategory: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put("/category/update", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/update failed.`, error);
            throw error;
        }
    },

    deleteCategory: async (categoryId: number) => {
        try {
            const res = await axiosInstance.delete(`/category/${categoryId}/delete`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/{id}/delete failed.`, error);
            throw error;
        }
    },

    restoreCategory: async (categoryId: number) => {
        try {
            const res = await axiosInstance.post(`/category/${categoryId}/restore`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/{id}/restore failed.`, error);
            throw error;
        }
    },

    moveCategory: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.post("/category/move", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/move failed.`, error);
            throw error;
        }
    },

    getParentCategory: async (categoryId: number) => {
        try {
            const res = await axiosInstance.get(`/category/${categoryId}/parents`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/{id}/parents failed.`, error);
            throw error;
        }
    },
};
