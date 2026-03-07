import { createFallbackCategoryResponse } from "@/data/static-fallback";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { Category } from "@/types/navbar";

const WARNING_PREFIX = "[WARNING][CategoryApi]";

function isPageCategory(value: unknown): value is PageResponse<Category> {
    if (!value || typeof value !== "object") return false;
    const payload = value as PageResponse<Category>;
    return Array.isArray(payload.data) && typeof payload.pageNumber === "number";
}

function isWrappedCategory(value: unknown): value is ApiResponse<PageResponse<Category>> {
    if (!value || typeof value !== "object") return false;
    const payload = value as ApiResponse<PageResponse<Category>>;
    return isPageCategory(payload.data);
}

function normalizeCategoryResponse(payload: unknown, page: number, size: number, message: string): ApiResponse<PageResponse<Category>> {
    if (isWrappedCategory(payload)) return payload;
    if (isPageCategory(payload)) {
        return { status: 200, message, data: payload };
    }
    console.warn(`${WARNING_PREFIX} Invalid category response shape. Fallback static data is used.`);
    return createFallbackCategoryResponse();
}

export const CategoryApi = {
    getPublicCategories: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/category/all", { params: { ...query, page, size } });
            return normalizeCategoryResponse(res.data, page, size, "Category list fetched");
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/all failed. Fallback static data is used.`, error);
            return createFallbackCategoryResponse();
        }
    },

    getAdminCategories: async (query?: { keyword?: string; sort?: string; page?: number; size?: number }) => {
        const page = query?.page ?? 1;
        const size = query?.size ?? 10;
        try {
            const res = await axiosInstance.get("/category/list", { params: { ...query, page, size } });
            return normalizeCategoryResponse(res.data, page, size, "Category list fetched");
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/list failed. Fallback static data is used.`, error);
            return createFallbackCategoryResponse();
        }
    },

    getCategoryDetail: async (categoryId: number): Promise<ApiResponse<Category>> => {
        try {
            const res = await axiosInstance.get(`/category/${categoryId}`);
            const payload = res.data as ApiResponse<Category>;
            if (!payload || typeof payload !== "object" || !payload.data || typeof payload.data !== "object") {
                console.warn(`${WARNING_PREFIX} Invalid /category/{id} response shape. Fallback category detail is used.`);
                const fallback = createFallbackCategoryResponse().data.data[0];
                return { status: 200, message: "Fallback category detail", data: fallback };
            }
            return payload;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/{id} failed. Fallback category detail is used.`, error);
            const fallback = createFallbackCategoryResponse().data.data[0];
            return { status: 200, message: "Fallback category detail", data: fallback };
        }
    },

    /** POST /category/add — Create new category */
    addCategory: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.post("/category/add", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/add failed.`, error);
            throw error;
        }
    },

    /** PUT /category/update — Update category */
    updateCategory: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.put("/category/update", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/update failed.`, error);
            throw error;
        }
    },

    /** DELETE /category/{id}/delete — Delete category */
    deleteCategory: async (categoryId: number) => {
        try {
            const res = await axiosInstance.delete(`/category/${categoryId}/delete`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/{id}/delete failed.`, error);
            throw error;
        }
    },

    /** POST /category/{id}/restore — Restore deleted category */
    restoreCategory: async (categoryId: number) => {
        try {
            const res = await axiosInstance.post(`/category/${categoryId}/restore`);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/{id}/restore failed.`, error);
            throw error;
        }
    },

    /** POST /category/move — Move category (change parent) */
    moveCategory: async (payload: Record<string, unknown>) => {
        try {
            const res = await axiosInstance.post("/category/move", payload);
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/move failed.`, error);
            throw error;
        }
    },

    /** GET /category/{id}/parents — Get parent categories */
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

