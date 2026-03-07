import { createFallbackCategoryResponse } from "@/data/static-fallback";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { Category } from "@/types/navbar";

const WARNING_PREFIX = "[WARNING][NavbarApi]";

function isValidCategoryResponse(payload: unknown): payload is ApiResponse<PageResponse<Category>> {
    if (!payload || typeof payload !== "object") return false;
    const data = (payload as ApiResponse<PageResponse<Category>>).data;
    return !!data && Array.isArray(data.data);
}

export const NavbarApi = {
    getCategoryAll: async (): Promise<ApiResponse<PageResponse<Category>>> => {
        try {
            const res = await axiosInstance.get<ApiResponse<PageResponse<Category>>>("/category/all");
            if (!isValidCategoryResponse(res.data)) {
                console.warn(`${WARNING_PREFIX} Invalid /category/all response shape. Fallback static data is used.`);
                return createFallbackCategoryResponse();
            }
            return res.data;
        } catch (error) {
            console.warn(`${WARNING_PREFIX} /category/all failed. Fallback static data is used.`, error);
            return createFallbackCategoryResponse();
        }
    },
};
