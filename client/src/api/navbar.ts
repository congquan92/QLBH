import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { Category } from "@/types/navbar";

const WARNING_PREFIX = "[WARNING][NavbarApi]";

function createEmptyCategoryResponse(): ApiResponse<PageResponse<Category>> {
    return {
        status: 200,
        message: "No category data",
        data: {
            data: [],
            pageNumber: 1,
            pageSize: 0,
            totalPages: 0,
            totalElements: 0,
        },
    };
}

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
                console.warn(`${WARNING_PREFIX} Invalid /category/all response shape.`);
                return createEmptyCategoryResponse();
            }
            return res.data;
        } catch (error) {
            console.error(`${WARNING_PREFIX} /category/all failed.`, error);
            return createEmptyCategoryResponse();
        }
    },
};
